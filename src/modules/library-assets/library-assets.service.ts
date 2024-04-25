import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Query,
} from '@nestjs/common';
import { Asset } from 'src/db/entities/assets.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { AssetsIssuance } from 'src/db/entities/assets_issuance.entity';
import { DUE_DATE, RE_DUE_DATE, USER_SERVICE } from 'src/common/constants';
import { CreateReturnAssetDto } from './dto/create-return-asset.dto';
import { CreateAssetIssuanceDto } from './dto/create-asset-issuance.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class LibraryAssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @Inject(USER_SERVICE)
    private readonly _userService: UsersService,

    @Inject(MailService)
    private mailService: MailService,

    @InjectEntityManager()
    private _entityManager: EntityManager,
  ) {}

  async findOne(id: string) {
    const record = await this.assetRepository.findOne({
      where: { id },
      relations: {
        category: true,
        publisher: true,
        distributer: true,
        material_type: true,
        currency: true,
        language: true,
        location: true,
        department: true,
        created_by_user: true,
        updated_by_user: true,
        archived_by_user: true,
      },
    });
    if (!record) {
      throw new HttpException('No Asset found', 404);
    }
    return record;
  }
  async searchByBarcode(barcode: string) {
    const record = await this.assetRepository.findOne({
      where: { barcode },
      relations: {
        category: true,
      },
    });
    if (!record) {
      throw new HttpException('No Asset found', 404);
    }
    let issuedRecord: any;
    if (!record.is_available) {
      issuedRecord = await this._entityManager
        .getRepository(AssetsIssuance)
        .createQueryBuilder('assetIssuance')
        .orderBy('assetIssuance.updated_at', 'DESC')
        .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
        .leftJoinAndSelect('borrower.department', 'department')
        .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
        .leftJoinAndSelect('asset.category', 'category')
        .leftJoinAndSelect('assetIssuance.issued_by', 'Issuer')
        .where('asset.id = :id', { id: record.id })
        .andWhere('assetIssuance.return_date IS NULL')
        .getOne();
    }
    const data = {
      issuedRecord: issuedRecord,
      record: record,
    };
    return data;
  }

  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Asset>> {
    const builder = this.assetRepository
      .createQueryBuilder('assets')

      .leftJoinAndSelect('assets.category', 'category')
      .leftJoinAndSelect('assets.publisher', 'publisher')
      .leftJoinAndSelect('assets.material_type', 'material_type')
      .leftJoinAndSelect('assets.language', 'language')
      .leftJoinAndSelect('assets.location', 'location')
      .leftJoinAndSelect('assets.department', 'department');

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
      case 'department':
        builder.orderBy('department.name', pageOptionsDto.order);
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

    if (pageOptionsDto.category) {
      const categoryArray = pageOptionsDto.category.split(',');
      builder.andWhere('category.name IN (:...categoryKeywords)', {
        categoryKeywords: categoryArray,
      });
    }
    if (pageOptionsDto.material_type) {
      const material_typesArray = pageOptionsDto.material_type.split(',');
      builder.andWhere('material_type.name IN (:...materialTypeKeywords)', {
        materialTypeKeywords: material_typesArray,
      });
    }

    if (pageOptionsDto.language) {
      const languageArray = pageOptionsDto.language.split(',');
      builder.andWhere('language.name IN (:...languageKeywords)', {
        languageKeywords: languageArray,
      });
    }

    if (pageOptionsDto.location) {
      const locationArray = pageOptionsDto.location.split(',');
      builder.andWhere('location.name IN (:...locationKeywords)', {
        locationKeywords: locationArray,
      });
    }

    if (pageOptionsDto.department) {
      const departmentArray = pageOptionsDto.department.split(',');
      builder.andWhere('department.name IN (:...departmentKeywords', {
        departmentKeywords: departmentArray,
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

  //Issue Material get

  async getIssueAsset(Id: string) {
    const assetRecord = await this.assetRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .where('assets.id = :id', { id: Id })
      .andWhere('assets.archived_at IS NULL')
      .getOne();

    if (!assetRecord) {
      throw new HttpException('No Asset Found', 400);
    }
    const userRecords = await this._userService.lookup();

    const data = {
      isssuing_asset: assetRecord,
      usersList: userRecords,
    };
    return data;
  }

  //   private generateBookBorrowEmail(Book Title: string, borrowerName: string, dueDate: string): string {
  //     return `
  //         <p>Dear ${borrowerName},</p>
  //         <p>This is a reminder that you have borrowed the book "${bookTitle}" from our library.</p>
  //         <p>The book is due on ${dueDate}.</p>
  //         <p>Please return the book on time to avoid any late fees.</p>
  //         <p>Thank you for using our library!</p>
  //     `;
  // }

  //Issue Material set
  async setIssueAsset(createAssetIssuanceDto: CreateAssetIssuanceDto, payload) {
    const borrowerRecord = await this._userService.findOne(
      createAssetIssuanceDto.borrowerId,
    );
    if (!borrowerRecord) {
      throw new HttpException('Borrower not found', 400);
    }
    const assetRecord = await this.assetRepository.findOne({
      where: { id: createAssetIssuanceDto.assetId },
      relations: { category: true },
    });
    if (!assetRecord) {
      throw new HttpException('Asset not found', 402);
    }
    if (!assetRecord.is_available) {
      throw new HttpException('Asset is is already issued.', 403);
    }

    await this._entityManager.transaction(async (manager) => {
      const issuanceObj = new AssetsIssuance();
      issuanceObj.borrower = borrowerRecord;
      issuanceObj.issued_asset = assetRecord;
      issuanceObj.due_date = DUE_DATE();
      issuanceObj.issued_by = payload.user;
      await manager.save(issuanceObj);

      await this.mailService.AssetIssuance(
        assetRecord,
        borrowerRecord,
        issuanceObj,
      );
    });
    await this.assetRepository.update(
      { id: assetRecord.id },
      { is_available: false },
    );
  }

  async getReIssuance(id: string) {
    const issuedRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .orderBy('assetIssuance.updated_at', 'DESC')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('borrower.department', 'department')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.issued_by', 'Issuer')
      .where('asset.id = :id', { id: id })
      .andWhere('assetIssuance.return_date IS NULL')
      .getOne();
    if (!issuedRecord) {
      throw new HttpException('Issued Asset not found', HttpStatus.NOT_FOUND);
    }
    return issuedRecord;
  }

  async setReIssuance(id: string, payload) {
    const issuedRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .orderBy('assetIssuance.updated_at', 'DESC')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('borrower.department', 'department')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.issued_by', 'Issuer')
      .where('asset.id = :id', { id: id })
      .andWhere('assetIssuance.return_date IS NULL')
      .getOne();

    if (!issuedRecord) {
      throw new HttpException('Issued Asset not found', HttpStatus.NOT_FOUND);
    }
    return await this._entityManager.transaction(async (manager) => {
      const issuanceObj = new AssetsIssuance();
      issuanceObj.borrower = issuedRecord.borrower;
      issuanceObj.issued_asset = issuedRecord.issued_asset;
      issuanceObj.due_date = issuedRecord.due_date;
      issuanceObj.re_due_date = RE_DUE_DATE(
        issuedRecord.re_due_date
          ? issuedRecord.re_due_date
          : issuedRecord.due_date,
      );
      issuanceObj.issued_by = issuedRecord.issued_by;
      issuanceObj.re_issued_by = payload.user;
      issuanceObj.re_issued = true;

      const savingRecord = await manager.save(issuanceObj);

      await this.mailService.AssetReIssuance(issuedRecord, issuanceObj);

      return savingRecord;
    });
  }

  //return material get

  async getReturnAsset(id: string) {
    const issuedRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .orderBy('assetIssuance.updated_at', 'DESC')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('borrower.department', 'department')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.issued_by', 'Issuer')
      .leftJoinAndSelect('assetIssuance.re_issued_by', 'reIssuer')
      .where('asset.id = :id', { id })
      .andWhere('assetIssuance.return_date IS NULL')
      .getOne();
    if (!issuedRecord) {
      throw new HttpException('Issued Asset not found', HttpStatus.NOT_FOUND);
    }
    const data = {
      id: issuedRecord.id,
      borrower: issuedRecord.borrower,
      issued_asset: issuedRecord.issued_asset,
      issued_by: issuedRecord.issued_by,
      re_issued_by: issuedRecord.re_issued_by,
      issued_at: issuedRecord.create_at,
      due_date: issuedRecord.due_date,
      re_due_date: issuedRecord.re_due_date,
    };
    return data;
  }

  //Return Material set
  async setReturnAsset(
    id: string,
    createReturnAssetDto: CreateReturnAssetDto,
    payload,
  ) {
    const issuedAssetRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .orderBy('assetIssuance.updated_at', 'DESC')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('borrower.department', 'department')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.issued_by', 'Issuer')
      .where('asset.id = :id', { id })
      .andWhere('assetIssuance.return_date IS NULL')
      .getOne();
    if (!issuedAssetRecord) {
      throw new HttpException('Issued Asset not found.', HttpStatus.NOT_FOUND);
    }

    const returnDate = new Date();

    issuedAssetRecord.return_date = returnDate;
    issuedAssetRecord.remarks_on_return_condition =
      createReturnAssetDto.remarks_on_return_condition;
    issuedAssetRecord.fine_amount = createReturnAssetDto.fine_amount;
    issuedAssetRecord.returned_by = payload.user;

    await this._entityManager.transaction(async (manager) => {
      await manager.save(issuedAssetRecord);
      await this.mailService.AssetReturn(issuedAssetRecord);
    });
    await this.assetRepository.update(
      { id: issuedAssetRecord.issued_asset.id },
      { is_available: true },
    );
  }

  async issuedAssets(payload: any) {
    const issuedAssetsRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .where('borrower.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NULL')
      .andWhere('assetIssuance.re_due_date IS NULL')
      .andWhere('assetIssuance.re_issued = :bool', { bool: false })
      .groupBy('assetIssuance.issued_asset')
      .orderBy('assetIssuance.create_at')
      .getMany();

    if (!issuedAssetsRecord) {
      throw new HttpException(
        'No Currently Issued Assets Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedAssetsRecord;
  }

  async reIssuedAssets(payload: any) {
    const issuedAssetsRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .where('borrower.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NULL')
      .andWhere('assetIssuance.re_due_date IS NOT NULL')
      .andWhere('assetIssuance.re_issued = :bool', { bool: true })
      .groupBy('assetIssuance.issued_asset')
      .orderBy('assetIssuance.create_at')
      .getMany();

    if (!issuedAssetsRecord) {
      throw new HttpException(
        'No Currently Issued Assets Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedAssetsRecord;
  }

  async issuedAssetsHistory(payload: any) {
    const issuedHistroy = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .where('borrower.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NOT NULL')
      .getMany();

    if (!issuedHistroy) {
      throw new HttpException(
        'No Issued Assets Histroy Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedHistroy;
  }

  async issuedAssetsBy(payload: any) {
    const issuedAssetsRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('assetIssuance.issued_by', 'issued_by')
      .where('issued_by.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NULL')
      .andWhere('assetIssuance.re_due_date IS NULL')
      .andWhere('assetIssuance.re_issued = :bool', { bool: false })
      .getMany();

    if (!issuedAssetsRecord) {
      throw new HttpException(
        'No Currently Issued Assets Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedAssetsRecord;
  }
  async issuedAssetsByHistory(payload: any) {
    const issuedAssetsRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('assetIssuance.issued_by', 'issued_by')
      .where('issued_by.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NOT NULL')
      .andWhere('assetIssuance.re_due_date IS NULL')
      .andWhere('assetIssuance.re_issued = :bool', { bool: false })
      .getMany();

    if (!issuedAssetsRecord) {
      throw new HttpException(
        'No Currently Issued Assets Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedAssetsRecord;
  }

  async reIssuedAssetsBy(payload: any) {
    const issuedAssetsRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('assetIssuance.re_issued_by', 're_issued_by')
      .where('re_issued_by.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NULL')
      .andWhere('assetIssuance.re_due_date IS NOT NULL')
      .andWhere('assetIssuance.re_issued = :bool', { bool: true })
      .getMany();

    if (!issuedAssetsRecord) {
      throw new HttpException(
        'No Currently Issued Assets Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedAssetsRecord;
  }

  async reIssuedAssetsByHistory(payload: any) {
    const issuedAssetsRecord = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('assetIssuance.re_issued_by', 're_issued_by')
      .where('re_issued_by.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NOT NULL')
      .andWhere('assetIssuance.re_due_date IS NOT NULL')
      .andWhere('assetIssuance.re_issued = :bool', { bool: true })
      .getMany();

    if (!issuedAssetsRecord) {
      throw new HttpException(
        'No Currently Issued Assets Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedAssetsRecord;
  }

  async returnAssetsByHistory(payload: any) {
    const issuedHistroy = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('assetIssuance.returned_by', 'returned_by')
      .where('returned_by.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NOT NULL')
      .getMany();

    if (!issuedHistroy) {
      throw new HttpException(
        'No Issued Assets Histroy Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return issuedHistroy;
  }

  async librarianDashboardData() {
    const todayDate = new Date().toISOString().split('T')[0];

    const issuedAssets = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .groupBy('assetIssuance.issued_asset')
      .orderBy('assetIssuance.create_at')
      .where('asset.is_available = :bool', { bool: false })
      .andWhere('assetIssuance.return_date IS NULL')
      .getMany();

    const overdueAssets = issuedAssets.filter((issuedAsset) => {
      const todayDateparsed = Date.parse(todayDate);
      const due_date = Date.parse(`${issuedAsset.due_date}`);
      const re_due_date = Date.parse(`${issuedAsset.re_due_date}`);

      if (issuedAsset.re_due_date) {
        if (todayDateparsed > re_due_date) {
          return issuedAsset;
        }
      } else if (todayDateparsed > due_date) {
        return issuedAsset;
      }
    });

    const issuedAssetsCount = issuedAssets.length;
    const overdueAssetsCount = overdueAssets.length;

    const usersCount = await this._userService.userCount();

    return { issuedAssetsCount, overdueAssetsCount, usersCount };
  }

  async userDashboardData(payload: any) {
    const todayDate = new Date().toISOString().split('T')[0];

    const issuedAssets = await this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .groupBy('assetIssuance.issued_asset')
      .orderBy('assetIssuance.create_at')
      .where('asset.is_available = :bool', { bool: false })
      .andWhere('borrower.id = :userId', { userId: payload.sub })
      .andWhere('assetIssuance.return_date IS NULL')
      .getMany();

    const overdueAssets = issuedAssets.filter((issuedAsset) => {
      const todayDateparsed = Date.parse(todayDate);
      const due_date = Date.parse(`${issuedAsset.due_date}`);
      const re_due_date = Date.parse(`${issuedAsset.re_due_date}`);

      if (issuedAsset.re_due_date) {
        if (todayDateparsed > re_due_date) {
          return issuedAsset;
        }
      } else if (todayDateparsed > due_date) {
        return issuedAsset;
      }
    });

    const issuedAssetsCount = issuedAssets.length;
    const overdueAssetsCount = overdueAssets.length;

    return { issuedAssetsCount, overdueAssetsCount };
  }

  async getTenNewArrivals() {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const builder = this.assetRepository
      .createQueryBuilder('assets')
      .leftJoinAndSelect('assets.category', 'category')
      .andWhere('assets.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('assets.created_at <= :currentDate', { currentDate })
      .take(10)
      .getMany();

    return builder;
  }

  //convert to pagedata

  async borrowedAssetsList(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.publisher', 'publisher')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('borrower.department', 'department')
      .groupBy('assetIssuance.issued_asset')
      .orderBy('assetIssuance.create_at');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('asset.title', pageOptionsDto.order);
        break;
      case 'asset':
        queryBuilder.orderBy('asset.title', pageOptionsDto.order);
        break;
      case 'borrower':
        queryBuilder.orderBy('borrower.name', pageOptionsDto.order);
        break;
      case 'department':
        queryBuilder.orderBy('department.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('asset.title', pageOptionsDto.order);
        break;
    }

    queryBuilder
      .where('asset.is_available = :bool', { bool: false })
      .andWhere('assetIssuance.return_date IS NULL');

    if (pageOptionsDto.search) {
      queryBuilder.where(
        'asset.title LIKE :keyword OR borrower.name LIKE :keyword',
        {
          keyword: `%${pageOptionsDto.search}%`,
        },
      );
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<AssetsIssuance>(entities, pageMetaDto);
  }

  async returnedAssetsList(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this._entityManager
      .getRepository(AssetsIssuance)
      .createQueryBuilder('assetIssuance')
      .leftJoinAndSelect('assetIssuance.issued_asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.publisher', 'publisher')
      .leftJoinAndSelect('assetIssuance.borrower', 'borrower')
      .leftJoinAndSelect('assetIssuance.returned_by', 'returned_by')
      .where('assetIssuance.return_date IS NOT NULL');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('asset.title', pageOptionsDto.order);
        break;
      case 'asset':
        queryBuilder.orderBy('asset.title', pageOptionsDto.order);
        break;
      case 'borrower':
        queryBuilder.orderBy('borrower.name', pageOptionsDto.order);
        break;
      case 'department':
        queryBuilder.orderBy('department.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('asset.title', pageOptionsDto.order);
        break;
    }

    if (pageOptionsDto.search) {
      queryBuilder.where(
        'asset.title LIKE :keyword OR borrower.name LIKE :keyword',
        {
          keyword: `%${pageOptionsDto.search}%`,
        },
      );
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<AssetsIssuance>(entities, pageMetaDto);
  }
}
