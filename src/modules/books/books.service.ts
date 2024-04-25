import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import {
  CATEGORY_SERVICE,
  DEPARTMENT_SERVICE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  USER_SERVICE,
  CURRENCY_SERVICE,
  DUE_DATE,
  RE_DUE_DATE,
} from 'src/common/constants';
import { CategoriesService } from '../categories/categories.service';
import { DepartmentsService } from '../departments/departments.service';
import { PublishersService } from '../publishers/publishers.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { Asset } from 'src/db/entities/assets.entity';
import { UsersService } from '../users/users.service';
import { Author } from 'src/db/entities/author.entity';
import { AssetsIssuance } from 'src/db/entities/assets_issuance.entity';
import { Request } from 'express';
import { EntityManager, Repository } from 'typeorm';
import { CurrenciesService } from '../currencies/currencies.service';
import * as fs from 'fs';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Asset)
    private readonly bookRepository: Repository<Asset>,

    @Inject(CATEGORY_SERVICE)
    private readonly _categoriesService: CategoriesService,

    @Inject(DEPARTMENT_SERVICE)
    private readonly _departmentsService: DepartmentsService,

    @Inject(PUBLISHER_SERVICE)
    private readonly _publisherService: PublishersService,

    @Inject(MATERIAL_TYPE_SERVICE)
    private readonly _materialTypeService: MaterialTypeService,

    @Inject(LANGUAGE_SERVICE)
    private readonly _languageService: LanguagesService,

    @Inject(LOCATION_SERVICE)
    private readonly _locationService: LocationsService,

    @Inject(USER_SERVICE)
    private readonly _userService: UsersService,

    @Inject(CURRENCY_SERVICE)
    private readonly currencyService: CurrenciesService,

    @InjectEntityManager()
    private _entityManager: EntityManager,
  ) {}

  async getBooksById(id: string) {
    return await this.bookRepository.find({
      where: {
        id: id,
      },
    });
  }

  async create(
    createBookDto: CreateBookDto,
    file: Express.Multer.File,
    payload,
  ) {
    const categoryRecord = await this._categoriesService.findOne('book');
    if (!categoryRecord) {
      throw new HttpException(
        'Given category Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const publisherRecord = await this._publisherService.findOne(
      createBookDto.publisherId,
    );
    if (!publisherRecord) {
      throw new HttpException(
        'Given publisher Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    let distributerRecord;
    if (createBookDto.distributerId) {
      distributerRecord = await this._publisherService.findOne(
        createBookDto.distributerId,
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

    const materialTypeRecord = await this._materialTypeService.findOne(
      createBookDto.material_typeId,
    );
    if (!materialTypeRecord) {
      throw new HttpException(
        'Given Material Type Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const languagesRecord = await this._languageService.findOne(
      createBookDto.languageId,
    );
    if (!languagesRecord) {
      throw new HttpException(
        'Given language Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const locationRecord = await this._locationService.findOne(
      createBookDto.locationId,
    );
    if (!locationRecord) {
      throw new HttpException(
        'Given Location Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const departmentRecord = await this._departmentsService.findOne(
      createBookDto.departmentId,
    );
    if (!departmentRecord) {
      throw new HttpException(
        'Given Department Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    let currencyRecord;
    if (createBookDto.currencyId) {
      currencyRecord = await this.currencyService.findOne(
        createBookDto.currencyId,
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

    const latestAccNoRecord = await this.bookRepository
      .createQueryBuilder('assets')
      .select('assets.acc_no')
      .orderBy('assets.acc_no', 'DESC')
      .getOne();
    const existingAccNo = latestAccNoRecord?.acc_no || 'ACC-0000'; //Default to ACC-0000 if no acc_no found
    const nextNumber = parseInt(existingAccNo.split('-')[1]) + 1; //generating next number
    const newAccNo = `ACC-${nextNumber.toString().padStart(4, '0')}`;

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

    const record = this.bookRepository.create({
      cover: filePath,
      acc_no: newAccNo,
      call_no: createBookDto.call_no,
      category: categoryRecord,
      title: createBookDto.title,
      subTitle: createBookDto.subTitle,
      author: createBookDto.author,
      subAuthor: createBookDto.subAuthor,
      edition_no: createBookDto.edition_no,
      publisher: publisherRecord,
      distributer: distributerRecord,
      accompanying_material: createBookDto.accompanying_material,
      material_type: materialTypeRecord,
      isbn_no: createBookDto.isbn_no,
      ddc_classification_no: createBookDto.ddc_classification_no,
      publishing_year: createBookDto.publishing_year,
      date_of_purchase: createBookDto.date_of_purchase,
      price: createBookDto.price,
      currency: currencyRecord,
      total_pages: createBookDto.total_pages,
      language: languagesRecord,
      barcode: barcodeNumber,
      location: locationRecord,
      location_placed: createBookDto.location_placed,
      department: departmentRecord,
      donated_by: createBookDto.donated_by,
      description: createBookDto.description,
      created_by_user: payload.user,
    });

    await this.bookRepository.save(record);

    await this._entityManager.transaction(async (authorManage) => {
      const authorRecord = new Author();
      authorRecord.name = createBookDto.author;
      authorRecord.primaryAuthor = true;

      try {
        await authorManage.save(authorRecord);
      } catch (error) {
        return;
      }
    });

    return 'Book Created Successfully';
  }

  Lookup() {
    return this.bookRepository.find();
  }

  async getUpdate(Id: string) {
    const updateRecord = await this.bookRepository.findOne({
      where: { id: Id },
    });
    if (!updateRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    const result = await this.bookRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.distributer', 'distributer')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location')
      .leftJoinAndSelect('assets.currency', 'currency')
      .leftJoinAndSelect('assets.department', 'department')
      .where('assets.id = :id', { id: Id })
      .andWhere('assets.archived_at IS NULL', { archived_at: null })
      .getOne();
    return result;
  }

  async setUpdate(
    @Param('id') id: string,
    _updateBookDto: UpdateBookDto,
    payload,
    file,
  ) {
    const bookRecord = await this.bookRepository.findOne({
      where: { id },
    });

    if (_updateBookDto.publisherId !== undefined) {
      const publisherRecord = await this._publisherService.findOne(
        _updateBookDto.publisherId,
      );
      if (!publisherRecord) {
        throw new HttpException('Publisher not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.publisher = publisherRecord;
    }

    if (_updateBookDto.distributerId !== 'null') {
      const distributerRecord = await this._publisherService.findOne(
        _updateBookDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.distributer = distributerRecord;
    }

    if (_updateBookDto.languageId !== undefined) {
      const languageRecord = await this._languageService.findOne(
        _updateBookDto.languageId,
      );
      if (!languageRecord) {
        throw new HttpException('Language not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.language = languageRecord;
    }

    if (_updateBookDto.locationId !== undefined) {
      const locationRecord = await this._locationService.findOne(
        _updateBookDto.locationId,
      );
      if (!locationRecord) {
        throw new HttpException('Location not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.location = locationRecord;
    }

    if (_updateBookDto.locationId !== undefined) {
      const materialTypeRecord = await this._materialTypeService.findOne(
        _updateBookDto.material_typeId,
      );
      if (!materialTypeRecord) {
        throw new HttpException(
          'Material Type not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      bookRecord.material_type = materialTypeRecord;
    }

    if (_updateBookDto.currencyId !== 'null') {
      const currencyRecord = await this.currencyService.findOne(
        _updateBookDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException('Currency not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.currency = currencyRecord;
    }

    if (_updateBookDto.locationId !== undefined) {
      const departmentRecord = await this._departmentsService.findOne(
        _updateBookDto.departmentId,
      );
      if (!departmentRecord) {
        throw new HttpException(
          'Given Department Not Exists',
          HttpStatus.NOT_FOUND,
        );
      }
      bookRecord.department = departmentRecord;
    }

    if (file) {
      const oldfile = bookRecord.cover;
      bookRecord.cover = `\\images\\${file.filename}`;
      if (oldfile !== '\\avatar\\noImage.jpg') {
        fs.unlinkSync(`.\\uploads${oldfile}`);
      }
    }

    bookRecord.call_no = _updateBookDto.call_no;
    bookRecord.title = _updateBookDto.title;
    bookRecord.subTitle = _updateBookDto.subTitle;
    bookRecord.author = _updateBookDto.author;
    bookRecord.subAuthor = _updateBookDto.subAuthor;
    bookRecord.edition_no = _updateBookDto.edition_no;
    bookRecord.accompanying_material = _updateBookDto.accompanying_material;
    bookRecord.isbn_no = _updateBookDto.isbn_no;
    bookRecord.publishing_date = _updateBookDto.date_of_purchase;
    bookRecord.date_of_purchase = _updateBookDto.date_of_purchase;
    bookRecord.ddc_classification_no = _updateBookDto.ddc_classification_no;
    bookRecord.price = _updateBookDto.price;
    bookRecord.total_pages = _updateBookDto.total_pages;
    bookRecord.location_placed = _updateBookDto.location_placed;
    bookRecord.donated_by = _updateBookDto.donated_by;
    bookRecord.description = _updateBookDto.description;
    bookRecord.updated_by_user = payload.user;
    await this.bookRepository.save(bookRecord);

    if (_updateBookDto.author) {
      await this._entityManager.transaction(async (authorManage) => {
        const authorRecord = new Author();
        authorRecord.name = _updateBookDto.author;
        authorRecord.primaryAuthor = true;

        try {
          await authorManage.save(authorRecord);
        } catch (error) {
          return;
        }
      });
    }
    return 'Book Updated Successfully';
  }

  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Asset>> {
    const builder = this.bookRepository
      .createQueryBuilder('assets')

      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location')
      .leftJoinAndSelect('assets.department', 'department');
    builder.andWhere('category.name LIKE :category', { category: `book` });

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

    builder;

    if (pageOptionsDto.search) {
      builder.andWhere('assets.title LIKE :search ', {
        search: `%${pageOptionsDto.search}%`,
      });
    }
    if (pageOptionsDto.author) {
      builder.andWhere('assets.author LIKE :author ', {
        author: `%${pageOptionsDto.author}%`,
      });
    }
    if (pageOptionsDto.material_type) {
      builder.andWhere('material_type.name LIKE :material_type ', {
        material_type: `%${pageOptionsDto.material_type}%`,
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
    if (pageOptionsDto.department) {
      builder.andWhere('department.name LIKE :department ', {
        department: `%${pageOptionsDto.department}%`,
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

    builder.andWhere('assets.archived_at IS NULL', { archived_at: null });
    builder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await builder.getCount();
    const { entities } = await builder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Asset>(entities, pageMetaDto);
  }

  async remove(id: string, payload) {
    await this.bookRepository
      .createQueryBuilder('assets')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
    await this.bookRepository.update(
      { id },
      { archived_by_user: payload.user },
    );
    return 'Book Deleted Successfully.';
  }
}
