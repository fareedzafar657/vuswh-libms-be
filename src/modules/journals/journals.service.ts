import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import {
  CATEGORY_SERVICE,
  CURRENCY_SERVICE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  USER_SERVICE,
} from 'src/common/constants';
import { CategoriesService } from '../categories/categories.service';
import { PublishersService } from '../publishers/publishers.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { Asset } from 'src/db/entities/assets.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { UsersService } from '../users/users.service';
import { AssetsIssuance } from 'src/db/entities/assets_issuance.entity';
import { Request } from 'express';
import * as fs from 'fs';

@Injectable()
export class JournalsService {
  constructor(
    @InjectRepository(Asset)
    private readonly journalRepository: Repository<Asset>,

    @Inject(CATEGORY_SERVICE)
    private readonly _categoryService: CategoriesService,

    @Inject(PUBLISHER_SERVICE)
    private readonly _publisherService: PublishersService,

    @Inject(MATERIAL_TYPE_SERVICE)
    private readonly _materialTypeService: MaterialTypeService,

    @Inject(LANGUAGE_SERVICE)
    private readonly _languageService: LanguagesService,

    @Inject(LOCATION_SERVICE)
    private readonly _locationService: LocationsService,

    @Inject(CURRENCY_SERVICE)
    private readonly _currencyService: CurrenciesService,

    @Inject(USER_SERVICE)
    private readonly _userService: UsersService,

    @InjectEntityManager()
    private readonly _entityManager: EntityManager,
  ) {}

  async getJournalById(id: string) {
    return await this.journalRepository.find({
      where: {
        id: id,
      },
    });
  }

  async create(
    createJournalDto: CreateJournalDto,
    file: Express.Multer.File,
    payload,
  ) {
    const categoryRecord = await this._categoryService.findOne('journal');

    if (!categoryRecord) {
      throw new HttpException('Category not exist', HttpStatus.NOT_FOUND);
    }

    const publisherRecord = await this._publisherService.findOne(
      createJournalDto.publisherId,
    );

    if (!publisherRecord) {
      throw new HttpException('Publisher not exists', HttpStatus.NOT_FOUND);
    }

    let distributerRecord;
    if (createJournalDto.distributerId) {
      distributerRecord = await this._publisherService.findOne(
        createJournalDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not exists', HttpStatus.NOT_FOUND);
      }
    } else {
      distributerRecord = null;
    }

    const materialTypeRecord = await this._materialTypeService.findOne(
      createJournalDto.material_typeId,
    );
    if (!materialTypeRecord) {
      throw new HttpException('Material not exists', HttpStatus.NOT_FOUND);
    }

    const languageRecord = await this._languageService.findOne(
      createJournalDto.languageId,
    );
    if (!languageRecord) {
      throw new HttpException('Language not exists', HttpStatus.NOT_FOUND);
    }

    const locationRecord = await this._locationService.findOne(
      createJournalDto.locationId,
    );
    if (!locationRecord) {
      throw new HttpException('Location not exists', HttpStatus.NOT_FOUND);
    }

    let currencyRecord;
    if (createJournalDto.currencyId) {
      currencyRecord = await this._currencyService.findOne(
        createJournalDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException('Currency not exists', HttpStatus.NOT_FOUND);
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

    const data = this.journalRepository.create({
      cover: filePath,
      title: createJournalDto.title,
      subTitle: createJournalDto.subTitle,
      category: categoryRecord,
      volume_no: createJournalDto.volume_no,
      publisher: publisherRecord,
      distributer: distributerRecord,
      material_type: materialTypeRecord,
      issn_no: createJournalDto.issn_no,
      publishing_date: createJournalDto.publishing_date,
      date_of_purchase: createJournalDto.date_of_purchase,
      price: createJournalDto.price,
      currency: currencyRecord,
      total_pages: createJournalDto.total_pages,
      language: languageRecord,
      location: locationRecord,
      location_placed: createJournalDto.location_placed,
      donated_by: createJournalDto.donated_by,
      description: createJournalDto.description,
      barcode: barcodeNumber,
      created_by_user: payload.user,
    });

    return this.journalRepository.save(data);
  }

  async getAllPageData(
    @Req() req: Request,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Asset>> {
    const builder = await this.journalRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location');
    builder.andWhere('category.name LIKE :category', { category: `%journal%` });

    switch (pageOptionsDto.orderBy) {
      case '':
        builder.orderBy('assets.title', pageOptionsDto.order);
        break;
      case 'title':
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
      builder.andWhere('location.name LIKE :material_type ', {
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

  async getUpdate(Id: string) {
    const updateRecord = await this.journalRepository.findOne({
      where: { id: Id },
    });
    if (!updateRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }

    const result = await this.journalRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.distributer', 'distributer')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location')
      .leftJoinAndSelect('assets.currency', 'currency')
      .where('assets.id = :id', { id: Id })
      .andWhere('assets.archived_at IS NULL', { archived_at: null })
      .getOne();
    return result;
  }

  async setUpdate(
    @Param('id') id: string,
    _updateJournalDto: UpdateJournalDto,
    payload,
    file,
  ) {
    const journalRecord = await this.journalRepository.findOne({
      where: { id },
    });

    if (_updateJournalDto.publisherId !== undefined) {
      const publisherRecord = await this._publisherService.findOne(
        _updateJournalDto.publisherId,
      );
      if (!publisherRecord) {
        throw new HttpException('Publisher not found.', HttpStatus.NOT_FOUND);
      }
      journalRecord.publisher = publisherRecord;
    }

    if (_updateJournalDto.distributerId !== 'null') {
      const distributerRecord = await this._publisherService.findOne(
        _updateJournalDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not found.', HttpStatus.NOT_FOUND);
      }
      journalRecord.distributer = distributerRecord;
    }

    if (_updateJournalDto.languageId !== undefined) {
      const languageRecord = await this._languageService.findOne(
        _updateJournalDto.languageId,
      );
      if (!languageRecord) {
        throw new HttpException('Language not found.', HttpStatus.NOT_FOUND);
      }
      journalRecord.language = languageRecord;
    }

    if (_updateJournalDto.locationId !== undefined) {
      const locationRecord = await this._locationService.findOne(
        _updateJournalDto.locationId,
      );
      if (!locationRecord) {
        throw new HttpException('Location not found.', HttpStatus.NOT_FOUND);
      }
      journalRecord.location = locationRecord;
    }

    if (_updateJournalDto.material_typeId !== undefined) {
      const materialTypeRecord = await this._materialTypeService.findOne(
        _updateJournalDto.material_typeId,
      );
      if (!materialTypeRecord) {
        throw new HttpException(
          'Material Type not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      journalRecord.material_type = materialTypeRecord;
    }

    if (_updateJournalDto.currencyId !== 'null') {
      const currencyRecord = await this._currencyService.findOne(
        _updateJournalDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException('Currency not found.', HttpStatus.NOT_FOUND);
      }
      journalRecord.currency = currencyRecord;
    }

    if (file) {
      const oldfile = journalRecord.cover;
      journalRecord.cover = `\\images\\${file.filename}`;
      if (oldfile !== '\\avatar\\noImage.jpg') {
        fs.unlinkSync(`.\\uploads${oldfile}`);
      }
    }

    journalRecord.title = _updateJournalDto.title;
    journalRecord.subTitle = _updateJournalDto.subTitle;
    journalRecord.issn_no = _updateJournalDto.issn_no;
    journalRecord.volume_no = _updateJournalDto.volume_no;
    journalRecord.issn_no = _updateJournalDto.issn_no;
    journalRecord.publishing_date = _updateJournalDto.publishing_date;
    journalRecord.date_of_purchase = _updateJournalDto.date_of_purchase;
    journalRecord.price = _updateJournalDto.price;
    journalRecord.total_pages = _updateJournalDto.total_pages;
    journalRecord.location_placed = _updateJournalDto.location_placed;
    journalRecord.donated_by = _updateJournalDto.donated_by;
    journalRecord.description = _updateJournalDto.description;
    journalRecord.updated_by_user = payload.user;
    return this.journalRepository.save(journalRecord);
  }

  async remove(id: string, payload) {
    await this.journalRepository
      .createQueryBuilder('assets')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
    await this.journalRepository.update(
      { id },
      { archived_by_user: payload.user },
    );
    return 'Journal Deleted Successfully';
  }
}
