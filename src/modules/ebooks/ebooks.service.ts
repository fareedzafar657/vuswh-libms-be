import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Query,
} from '@nestjs/common';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  CATEGORY_SERVICE,
  CURRENCY_SERVICE,
  DEPARTMENT_SERVICE,
  LANGUAGE_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  USER_SERVICE,
} from 'src/common/constants';
import { EntityManager, Repository } from 'typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { CategoriesService } from '../categories/categories.service';
import { DepartmentsService } from '../departments/departments.service';
import { PublishersService } from '../publishers/publishers.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { LanguagesService } from '../languages/languages.service';
import { UsersService } from '../users/users.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { Author } from 'src/db/entities/author.entity';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import * as fs from 'fs';

@Injectable()
export class EbooksService {
  constructor(
    @InjectRepository(Asset)
    private readonly ebookRepository: Repository<Asset>,

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

    @Inject(USER_SERVICE)
    private readonly _userService: UsersService,

    @Inject(CURRENCY_SERVICE)
    private readonly currencyService: CurrenciesService,

    @InjectEntityManager()
    private _entityManager: EntityManager,
  ) {}

  async setCreate(
    createEbookDto: CreateEbookDto,
    coverPath: string,
    pdfPath: string,
    payload,
  ) {
    const categoryRecord = await this._categoriesService.findOne('ebook');
    if (!categoryRecord) {
      throw new HttpException(
        'Given category Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const publisherRecord = await this._publisherService.findOne(
      createEbookDto.publisherId,
    );
    if (!publisherRecord) {
      throw new HttpException(
        'Given publisher Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    let distributerRecord;
    if (createEbookDto.distributerId) {
      distributerRecord = await this._publisherService.findOne(
        createEbookDto.distributerId,
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
      createEbookDto.material_typeId,
    );
    if (!materialTypeRecord) {
      throw new HttpException(
        'Given Material Type Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const languagesRecord = await this._languageService.findOne(
      createEbookDto.languageId,
    );
    if (!languagesRecord) {
      throw new HttpException(
        'Given language Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const departmentRecord = await this._departmentsService.findOne(
      createEbookDto.departmentId,
    );
    if (!departmentRecord) {
      throw new HttpException(
        'Given Department Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    let currencyRecord;
    if (createEbookDto.currencyId) {
      currencyRecord = await this.currencyService.findOne(
        createEbookDto.currencyId,
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

    const latestAccNoRecord = await this.ebookRepository
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

    const record = this.ebookRepository.create({
      cover: coverPath,
      pdf: pdfPath,
      acc_no: newAccNo,
      call_no: createEbookDto.call_no,
      category: categoryRecord,
      title: createEbookDto.title,
      subTitle: createEbookDto.subTitle,
      author: createEbookDto.author,
      subAuthor: createEbookDto.subAuthor,
      edition_no: createEbookDto.edition_no,
      publisher: publisherRecord,
      distributer: distributerRecord,
      material_type: materialTypeRecord,
      isbn_no: createEbookDto.isbn_no,
      publishing_year: createEbookDto.publishing_year,
      date_of_purchase: createEbookDto.date_of_purchase,
      ddc_classification_no: createEbookDto.ddc_classification_no,
      price: createEbookDto.price,
      currency: currencyRecord,
      total_pages: createEbookDto.total_pages,
      language: languagesRecord,
      barcode: barcodeNumber,
      department: departmentRecord,
      donated_by: createEbookDto.donated_by,
      description: createEbookDto.description,
      created_by_user: payload.user,
    });

    await this.ebookRepository.save(record);

    await this._entityManager.transaction(async (authorManage) => {
      const authorRecord = new Author();
      authorRecord.name = createEbookDto.author;
      authorRecord.primaryAuthor = true;

      try {
        await authorManage.save(authorRecord);
      } catch (error) {
        return;
      }
    });

    return 'eBook Created Successfully';
  }

  async getUpdate(Id: string) {
    const updateRecord = await this.ebookRepository.findOne({
      where: { id: Id },
    });
    if (!updateRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    const result = await this.ebookRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.distributer', 'distributer')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.currency', 'currency')
      .leftJoinAndSelect('assets.department', 'department')
      .where('assets.id = :id', { id: Id })
      .getOne();
    return result;
  }

  async setUpdate(
    @Param('id') id: string,
    updateEbookDto: UpdateEbookDto,
    payload,
    coverPath: string,
    pdfPath: string,
  ) {
    const bookRecord = await this.ebookRepository.findOne({
      where: { id },
    });

    if (updateEbookDto.publisherId !== undefined) {
      const publisherRecord = await this._publisherService.findOne(
        updateEbookDto.publisherId,
      );
      if (!publisherRecord) {
        throw new HttpException('Publisher not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.publisher = publisherRecord;
    }

    if (updateEbookDto.distributerId !== 'null') {
      const distributerRecord = await this._publisherService.findOne(
        updateEbookDto.distributerId,
      );
      if (!distributerRecord) {
        throw new HttpException('Distributor not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.distributer = distributerRecord;
    }

    if (updateEbookDto.languageId !== undefined) {
      const languageRecord = await this._languageService.findOne(
        updateEbookDto.languageId,
      );
      if (!languageRecord) {
        throw new HttpException('Language not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.language = languageRecord;
    }

    if (updateEbookDto.material_typeId !== undefined) {
      const materialTypeRecord = await this._materialTypeService.findOne(
        updateEbookDto.material_typeId,
      );
      if (!materialTypeRecord) {
        throw new HttpException(
          'Material Type not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      bookRecord.material_type = materialTypeRecord;
    }

    if (updateEbookDto.currencyId !== 'null') {
      const currencyRecord = await this.currencyService.findOne(
        updateEbookDto.currencyId,
      );
      if (!currencyRecord) {
        throw new HttpException('Currency not found.', HttpStatus.NOT_FOUND);
      }
      bookRecord.currency = currencyRecord;
    }

    if (updateEbookDto.departmentId !== undefined) {
      const departmentRecord = await this._departmentsService.findOne(
        updateEbookDto.departmentId,
      );
      if (!departmentRecord) {
        throw new HttpException(
          'Given Department Not Exists',
          HttpStatus.NOT_FOUND,
        );
      }
      bookRecord.department = departmentRecord;
    }

    if (coverPath) {
      const oldfile = bookRecord.cover;
      bookRecord.cover = coverPath;
      if (oldfile !== '\\avatar\\noImage.jpg') {
        fs.unlinkSync(`.\\uploads${oldfile}`);
      }
    }
    if (pdfPath) {
      const oldfile = bookRecord.pdf;
      bookRecord.pdf = pdfPath;
      if (oldfile !== null) {
        fs.unlinkSync(`.\\uploads${oldfile}`);
      }
    }

    bookRecord.call_no = updateEbookDto.call_no;
    bookRecord.title = updateEbookDto.title;
    bookRecord.subTitle = updateEbookDto.subTitle;
    bookRecord.author = updateEbookDto.author;
    bookRecord.subAuthor = updateEbookDto.subAuthor;
    bookRecord.edition_no = updateEbookDto.edition_no;
    bookRecord.ddc_classification_no = updateEbookDto.ddc_classification_no;
    bookRecord.isbn_no = updateEbookDto.isbn_no;
    bookRecord.publishing_date = updateEbookDto.date_of_purchase;
    bookRecord.date_of_purchase = updateEbookDto.date_of_purchase;
    bookRecord.price = updateEbookDto.price;
    bookRecord.total_pages = updateEbookDto.total_pages;
    bookRecord.donated_by = updateEbookDto.donated_by;
    bookRecord.description = updateEbookDto.description;
    bookRecord.updated_by_user = payload.user;
    await this.ebookRepository.save(bookRecord);

    if (updateEbookDto.author) {
      await this._entityManager.transaction(async (authorManage) => {
        const authorRecord = new Author();
        authorRecord.name = updateEbookDto.author;
        authorRecord.primaryAuthor = true;

        try {
          await authorManage.save(authorRecord);
        } catch (error) {
          return;
        }
      });
    }
    return 'eBook Updated Successfully';
  }

  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Asset>> {
    const builder = this.ebookRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.department', 'department');
    builder.andWhere('category.name LIKE :category', { category: `%ebook%` });

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
    if (pageOptionsDto.department) {
      builder.andWhere('department.name LIKE :department ', {
        department: `%${pageOptionsDto.department}%`,
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
    await this.ebookRepository
      .createQueryBuilder('assets')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
    await this.ebookRepository.update(
      { id },
      { archived_by_user: payload.user },
    );
    return 'eBook Deleted Successfully.';
  }
}
