import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { EntityManager, Repository } from 'typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { CategoriesService } from '../categories/categories.service';
import {
  CATEGORY_SERVICE,
  CURRENCY_SERVICE,
  DUE_DATE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  USER_SERVICE,
} from 'src/common/constants';
import { PublishersService } from '../publishers/publishers.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { UsersService } from '../users/users.service';
import { AssetsIssuance } from 'src/db/entities/assets_issuance.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as fs from 'fs';

@Injectable()
export class MagazinesService {
  constructor(
    @InjectRepository(Asset)
    private readonly magazineRepository: Repository<Asset>,

    @Inject(CATEGORY_SERVICE)
    private readonly _categoryService: CategoriesService,

    @Inject(PUBLISHER_SERVICE)
    private readonly _publisherService: PublishersService,

    @Inject(LANGUAGE_SERVICE)
    private readonly _languageService: LanguagesService,

    @Inject(LOCATION_SERVICE)
    private readonly _locationService: LocationsService,

    @Inject(MATERIAL_TYPE_SERVICE)
    private readonly _materialTypeService: MaterialTypeService,

    @Inject(CURRENCY_SERVICE)
    private readonly _currencyService: CurrenciesService,

    @Inject(USER_SERVICE)
    private readonly _userService: UsersService,

    @InjectEntityManager()
    private readonly _entityManager: EntityManager,
  ) {}

  async create(
    createMagazineDto: CreateMagazineDto,
    file: Express.Multer.File,
    payload,
  ) {
    const categoryRecord = await this._categoryService.findOne('magazine');
    if (!categoryRecord) {
      throw new HttpException('Category not exists', HttpStatus.NOT_FOUND);
    }
    const publisherRecord = await this._publisherService.findOne(
      createMagazineDto.publisherId,
    );
    if (!publisherRecord) {
      throw new HttpException('Publisher not exists', HttpStatus.NOT_FOUND);
    }

    let distributerRecord;
    if (createMagazineDto.distributerId) {
      distributerRecord = await this._publisherService.findOne(
        createMagazineDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not exists', HttpStatus.NOT_FOUND);
      }
    } else {
      distributerRecord = null;
    }

    const languageRecord = await this._languageService.findOne(
      createMagazineDto.languageId,
    );
    if (!languageRecord) {
      throw new HttpException('Language not exists', HttpStatus.NOT_FOUND);
    }
    const locationRecord = await this._locationService.findOne(
      createMagazineDto.locationId,
    );
    if (!locationRecord) {
      throw new HttpException('Location not exists', HttpStatus.NOT_FOUND);
    }
    const materialTypeRecord = await this._materialTypeService.findOne(
      createMagazineDto.material_typeId,
    );
    if (!materialTypeRecord) {
      throw new HttpException('Material not exists', HttpStatus.NOT_FOUND);
    }

    let currencyRecord;
    if (createMagazineDto.currencyId) {
      currencyRecord = await this._currencyService.findOne(
        createMagazineDto.currencyId,
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

    const data = this.magazineRepository.create({
      cover: filePath,
      title: createMagazineDto.title,
      subTitle: createMagazineDto.subTitle,
      category: categoryRecord,
      version_no: createMagazineDto.version_no,
      volume_no: createMagazineDto.volume_no,
      publisher: publisherRecord,
      distributer: distributerRecord,
      material_type: materialTypeRecord,
      publishing_date: createMagazineDto.publishing_date,
      date_of_purchase: createMagazineDto.date_of_purchase,
      price: createMagazineDto.price,
      currency: currencyRecord,
      total_pages: createMagazineDto.total_pages,
      language: languageRecord,
      location: locationRecord,
      location_placed: createMagazineDto.location_placed,
      donated_by: createMagazineDto.donated_by,
      description: createMagazineDto.description,
      barcode: barcodeNumber,
      created_by_user: payload.user,
    });

    return this.magazineRepository.save(data);
  }
  //
  async getAllPageData(
    req: Request,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Asset>> {
    const builder = this.magazineRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location');
    builder.andWhere('category.name LIKE :name', { name: `%magazine%` });

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

    builder;
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
    if (pageOptionsDto.location) {
      builder.andWhere('location.name LIKE :location ', {
        location: `%${pageOptionsDto.location}%`,
      });
    }
    builder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await builder.getCount();
    const { entities } = await builder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Asset>(entities, pageMetaDto);
  }

  async getUpdate(Id: string) {
    const updateRecord = await this.magazineRepository.findOne({
      where: { id: Id },
    });
    if (!updateRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    const result = await this.magazineRepository
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

  async setUpdate(
    id: string,
    updateMagazineDto: UpdateMagazineDto,
    payload,
    file,
  ) {
    const magazineRecord = await this.magazineRepository.findOne({
      where: { id },
    });
    if (!magazineRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }

    if (updateMagazineDto.publisherId !== undefined) {
      const publisherRecord = await this._publisherService.findOne(
        updateMagazineDto.publisherId,
      );
      if (!publisherRecord) {
        throw new HttpException('Publisher not found.', HttpStatus.NOT_FOUND);
      }
      magazineRecord.publisher = publisherRecord;
    }

    if (updateMagazineDto.distributerId !== 'null') {
      const distributerRecord = await this._publisherService.findOne(
        updateMagazineDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not found.', HttpStatus.NOT_FOUND);
      }
      magazineRecord.distributer = distributerRecord;
    }

    if (updateMagazineDto.languageId !== undefined) {
      const languageRecord = await this._languageService.findOne(
        updateMagazineDto.languageId,
      );
      if (!languageRecord) {
        throw new HttpException('Language not found.', HttpStatus.NOT_FOUND);
      }
      magazineRecord.language = languageRecord;
    }

    if (updateMagazineDto.locationId !== undefined) {
      const locationRecord = await this._locationService.findOne(
        updateMagazineDto.locationId,
      );
      if (!locationRecord) {
        throw new HttpException('Location not found.', HttpStatus.NOT_FOUND);
      }
      magazineRecord.location = locationRecord;
    }

    if (updateMagazineDto.material_typeId !== undefined) {
      const materialTypeRecord = await this._materialTypeService.findOne(
        updateMagazineDto.material_typeId,
      );
      if (!materialTypeRecord) {
        throw new HttpException(
          'Material Type not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      magazineRecord.material_type = materialTypeRecord;
    }

    if (updateMagazineDto.currencyId !== 'null') {
      const currencyRecord = await this._currencyService.findOne(
        updateMagazineDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException('Currency not found.', HttpStatus.NOT_FOUND);
      }
      magazineRecord.currency = currencyRecord;
    }

    if (file) {
      const oldfile = magazineRecord.cover;
      magazineRecord.cover = `\\images\\${file.filename}`;
      if (oldfile !== '\\avatar\\noImage.jpg') {
        fs.unlinkSync(`.\\uploads${oldfile}`);
      }
    }

    magazineRecord.title = updateMagazineDto.title;
    magazineRecord.subTitle = updateMagazineDto.subTitle;
    magazineRecord.version_no = updateMagazineDto.version_no;
    magazineRecord.volume_no = updateMagazineDto.volume_no;
    magazineRecord.publishing_date = updateMagazineDto.publishing_date;
    magazineRecord.date_of_purchase = updateMagazineDto.date_of_purchase;
    magazineRecord.price = updateMagazineDto.price;
    magazineRecord.total_pages = updateMagazineDto.total_pages;
    magazineRecord.location_placed = updateMagazineDto.location_placed;
    magazineRecord.donated_by = updateMagazineDto.donated_by;
    magazineRecord.description = updateMagazineDto.description;
    magazineRecord.updated_by_user = payload.user;
    return this.magazineRepository.save(magazineRecord);
  }

  async remove(id: string, payload) {
    await this.magazineRepository
      .createQueryBuilder('assets')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
    await this.magazineRepository.update(
      { id },
      { archived_by_user: payload.user },
    );
    return 'Magazine Deleted Successfully';
  }
}
