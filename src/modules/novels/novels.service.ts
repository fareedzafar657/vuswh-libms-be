import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Query,
  Req,
} from '@nestjs/common';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { Asset } from 'src/db/entities/assets.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  CATEGORY_SERVICE,
  PUBLISHER_SERVICE,
  MATERIAL_TYPE_SERVICE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  USER_SERVICE,
  CURRENCY_SERVICE,
} from 'src/common/constants';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { PublishersService } from '../publishers/publishers.service';
import { AssetsIssuance } from 'src/db/entities/assets_issuance.entity';
import { UsersService } from '../users/users.service';
import { Author } from 'src/db/entities/author.entity';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { Request } from 'express';
import { CurrenciesService } from '../currencies/currencies.service';
import * as fs from 'fs';

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(Asset)
    private readonly novelRepository: Repository<Asset>,

    @Inject(CATEGORY_SERVICE)
    private readonly categoriesService: CategoriesService,

    @Inject(PUBLISHER_SERVICE)
    private readonly publisherService: PublishersService,

    @Inject(MATERIAL_TYPE_SERVICE)
    private readonly materialTypeService: MaterialTypeService,

    @Inject(LANGUAGE_SERVICE)
    private readonly languageService: LanguagesService,

    @Inject(LOCATION_SERVICE)
    private readonly locationService: LocationsService,

    @Inject(USER_SERVICE)
    private readonly _userService: UsersService,

    @Inject(CURRENCY_SERVICE)
    private readonly _currencyService: CurrenciesService,

    @InjectEntityManager()
    private readonly _entityManager: EntityManager,
  ) {}
  async create(
    createNovelDto: CreateNovelDto,
    file: Express.Multer.File,
    payload,
  ) {
    const categoryRecord = await this.categoriesService.findOne('novel');
    if (!categoryRecord) {
      throw new HttpException(
        'Given category Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }
    const publisherRecord = await this.publisherService.findOne(
      createNovelDto.publisherId,
    );
    if (!publisherRecord) {
      throw new HttpException(
        'Given publisher Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const languageRecord = await this.languageService.findOne(
      createNovelDto.languageId,
    );
    if (!languageRecord) {
      throw new HttpException(
        'Given language Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }
    const locationRecord = await this.locationService.findOne(
      createNovelDto.locationId,
    );
    if (!locationRecord) {
      throw new HttpException(
        'Given location Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }
    const materialTypeRecord = await this.materialTypeService.findOne(
      createNovelDto.material_typeId,
    );
    if (!materialTypeRecord) {
      throw new HttpException(
        'Given material type Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    let distributerRecord;
    if (createNovelDto.distributerId) {
      distributerRecord = await this.publisherService.findOne(
        createNovelDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException(
          'Given Distributor Not Exists',
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      distributerRecord = null;
    }

    let currencyRecord;
    if (createNovelDto.currencyId) {
      currencyRecord = await this._currencyService.findOne(
        createNovelDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException(
          'Given Currency Not Exists',
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      currencyRecord = null;
    }

    const date = Date.now().toString();
    const random_part = (
      Math.floor(Math.random() * (900 - 100)) + 100
    ).toString();
    const barcodeNumber = date + random_part;

    let filePath: string;
    if (file) {
      filePath = `\\images\\${file.filename}`;
    } else {
      filePath = '\\avatar\\noImage.jpg';
    }

    const data = this.novelRepository.create({
      cover: filePath,
      title: createNovelDto.title,
      subTitle: createNovelDto.subTitle,
      author: createNovelDto.author,
      subAuthor: createNovelDto.subAuthor,
      category: categoryRecord,
      publisher: publisherRecord,
      distributer: distributerRecord,
      material_type: materialTypeRecord,
      volume_no: createNovelDto.volume_no,
      date_of_purchase: createNovelDto.date_of_purchase,
      publishing_year: createNovelDto.publishing_year,
      price: createNovelDto.price,
      currency: currencyRecord,
      total_pages: createNovelDto.total_pages,
      language: languageRecord,
      location: locationRecord,
      location_placed: createNovelDto.location_placed,
      donated_by: createNovelDto.donated_by,
      description: createNovelDto.description,
      barcode: barcodeNumber,
      created_by_user: payload.user,
    });

    await this.novelRepository.save(data);

    await this._entityManager.transaction(async (authorManage) => {
      const authorRecord = new Author();
      authorRecord.name = createNovelDto.author;
      authorRecord.primaryAuthor = true;

      try {
        await authorManage.save(authorRecord);
      } catch (error) {
        return;
      }
    });
    return 'Novel Created Successfully';
  }
  async getUpdate(Id: string) {
    const updateRecord = await this.novelRepository.findOne({
      where: { id: Id },
    });
    if (!updateRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    const result = await this.novelRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.distributer', 'distributer')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location')
      .leftJoinAndSelect('assets.currency', 'currency')
      .leftJoinAndSelect('assets.created_by_user', 'created_by_user')
      .where('assets.id = :id', { id: Id })
      .andWhere('assets.archived_at IS NULL', { archived_at: null })
      .getOne();
    return result;
  }

  async setUpdate(id: string, updateNovelDto: UpdateNovelDto, payload, file) {
    const novelRecord = await this.novelRepository.findOne({
      where: { id },
    });
    if (!novelRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }

    if (updateNovelDto.publisherId !== undefined) {
      const publisherRecord = await this.publisherService.findOne(
        updateNovelDto.publisherId,
      );
      if (!publisherRecord) {
        throw new HttpException('Publisher not found.', HttpStatus.NOT_FOUND);
      }
      novelRecord.publisher = publisherRecord;
    }

    if (updateNovelDto.distributerId !== 'null') {
      const distributerRecord = await this.publisherService.findOne(
        updateNovelDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not found.', HttpStatus.NOT_FOUND);
      }
      novelRecord.distributer = distributerRecord;
    }

    if (updateNovelDto.languageId !== undefined) {
      const languageRecord = await this.languageService.findOne(
        updateNovelDto.languageId,
      );
      if (!languageRecord) {
        throw new HttpException('Language not found.', HttpStatus.NOT_FOUND);
      }
      novelRecord.language = languageRecord;
    }

    if (updateNovelDto.languageId !== undefined) {
      const locationRecord = await this.locationService.findOne(
        updateNovelDto.languageId,
      );
      if (!locationRecord) {
        throw new HttpException('Location not found.', HttpStatus.NOT_FOUND);
      }
      novelRecord.location = locationRecord;
    }

    if (updateNovelDto.material_typeId !== undefined) {
      const materialTypeRecord = await this.materialTypeService.findOne(
        updateNovelDto.material_typeId,
      );
      if (!materialTypeRecord) {
        throw new HttpException(
          'Material Type not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      novelRecord.material_type = materialTypeRecord;
    }

    if (updateNovelDto.currencyId !== 'null') {
      const currencyRecord = await this._currencyService.findOne(
        updateNovelDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException('Currency not found.', HttpStatus.NOT_FOUND);
      }
      novelRecord.currency = currencyRecord;
    }

    if (file) {
      const oldfile = novelRecord.cover;
      novelRecord.cover = `\\images\\${file.filename}`;
      if (oldfile !== '\\avatar\\noImage.jpg') {
        fs.unlinkSync(`.\\uploads${oldfile}`);
      }
    }
    novelRecord.title = updateNovelDto.title;
    novelRecord.subTitle = updateNovelDto.subTitle;
    novelRecord.author = updateNovelDto.author;
    novelRecord.subAuthor = updateNovelDto.subAuthor;
    novelRecord.volume_no = updateNovelDto.volume_no;
    novelRecord.date_of_purchase = updateNovelDto.date_of_purchase;
    novelRecord.publishing_year = updateNovelDto.publishing_year;
    novelRecord.price = updateNovelDto.price;
    novelRecord.total_pages = updateNovelDto.total_pages;
    novelRecord.location_placed = updateNovelDto.location_placed;
    novelRecord.donated_by = updateNovelDto.donated_by;
    novelRecord.description = updateNovelDto.description;
    novelRecord.updated_by_user = payload.user;
    await this.novelRepository.save(novelRecord);

    if (updateNovelDto.author) {
      await this._entityManager.transaction(async (authorManage) => {
        const authorRecord = new Author();
        authorRecord.name = updateNovelDto.author;
        authorRecord.primaryAuthor = true;

        try {
          await authorManage.save(authorRecord);
        } catch (error) {
          return;
        }
      });
    }
  }

  async getAllPageData(
    @Req() req: Request,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Asset>> {
    const builder = this.novelRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location');
    builder.andWhere('category.name LIKE :category', {
      category: `%novel%`,
    });

    switch (pageOptionsDto.orderBy) {
      case '':
        builder.orderBy('assets.title', pageOptionsDto.order);
        break;
      case 'name':
        builder.orderBy('assets.title', pageOptionsDto.order);
        break;
      case 'category':
        builder.orderBy('category.name', pageOptionsDto.order);
        break;
      case 'language':
        builder.orderBy('language.name', pageOptionsDto.order);
        break;
      case 'location':
        builder.orderBy('location.name', pageOptionsDto.order);
        break;
      default:
        builder.orderBy('assets.title', pageOptionsDto.order);
        break;
    }

    if (pageOptionsDto.search) {
      builder.andWhere('assets.title LIKE :search ', {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    if (pageOptionsDto.language) {
      builder.andWhere('language.name LIKE :language ', {
        language: `%${pageOptionsDto.language}%`,
      });
    }
    if (pageOptionsDto.location) {
      builder.andWhere('location.name LIKE :location ', {
        location: `%${pageOptionsDto.location}%`,
      });
    }
    if (pageOptionsDto.material_type) {
      builder.andWhere('department.name LIKE :material_type ', {
        material_type: `%${pageOptionsDto.material_type}%`,
      });
    }
    if (pageOptionsDto.status) {
      builder.andWhere('assets.is_available = :statusKeyword', {
        statusKeyword: `${pageOptionsDto.status}`,
      });
    }
    if (pageOptionsDto.newArrival) {
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);

      builder
        .andWhere('assets.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .andWhere('assets.created_at <= :currentDate', { currentDate });
    }

    builder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await builder.getCount();
    const { entities } = await builder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Asset>(entities, pageMetaDto);
  }

  lookup() {
    return this.novelRepository.find();
  }

  async remove(id: string, payload) {
    await this.novelRepository
      .createQueryBuilder('assets')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
    await this.novelRepository.update(
      { id },
      { archived_by_user: payload.user },
    );
    return 'Novel Deleted Successfully.';
  }
}
