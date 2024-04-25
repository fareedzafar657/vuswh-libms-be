import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LibraryAssetsService } from './library-assets.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Asset } from 'src/db/entities/assets.entity';
import {
  CATEGORY_SERVICE,
  DEPARTMENT_SERVICE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  ROLES,
} from 'src/common/constants';
import { CategoriesService } from '../categories/categories.service';
import { DepartmentsService } from '../departments/departments.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { PublishersService } from '../publishers/publishers.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { createReadStream } from 'fs';
import { join } from 'path';
import { CreateReturnAssetDto } from './dto/create-return-asset.dto';
import { CreateAssetIssuanceDto } from './dto/create-asset-issuance.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Response } from 'express';
import * as path from 'path';

@ApiTags('Library Assets Common Apis')
@Controller('assets')
export class LibraryAssetsController {
  constructor(
    @Inject(LibraryAssetsService)
    private readonly libraryAssetsService: LibraryAssetsService,
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
    @Inject(DEPARTMENT_SERVICE)
    private readonly _departmentService: DepartmentsService,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}
  @ROLES(['librarian', 'user'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.libraryAssetsService.findOne(id);
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('searchByBarcode/:barcode')
  searchByBarcode(@Param('barcode') barcode: string) {
    return this.libraryAssetsService.searchByBarcode(barcode);
  }
  @ROLES(['librarian', 'user'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('pagedata')
  async getAllPageData(@Query() pageOptionsDto: PageOptionsDto) {
    const category = await this._categoryService.lookup();
    const publishers = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const locations = await this._locationService.lookup();
    const departments = await this._departmentService.lookup();

    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (!pageOptionsDto.search) {
      pageOptionsDto.search = '';
    }
    if (!pageOptionsDto.language) {
      pageOptionsDto.language = '';
    }
    if (!pageOptionsDto.location) {
      pageOptionsDto.location = '';
    }
    if (!pageOptionsDto.status) {
      pageOptionsDto.status = '';
    }
    if (!pageOptionsDto.newArrival) {
      pageOptionsDto.newArrival = '';
    }
    if (!pageOptionsDto.material_type) {
      pageOptionsDto.material_type = '';
    }
    if (!pageOptionsDto.department) {
      pageOptionsDto.department = '';
    }
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }

    const pagedata = await this.pageData(pageOptionsDto);
    const data = {
      pagedata,
      category,
      publishers,
      material_types,
      languages,
      locations,
      departments,
    };
    return data;
  }

  async pageData(@Query() pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.libraryAssetsService.getAllPageData(
      pageOptionsDto,
    );
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Get Book Record and Users list' })
  @ApiOperation({ summary: 'Book Issuance' })
  @ApiResponse({
    status: 400,
    description: 'No Book Found',
  })
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('issuance/:id')
  async getIssueAsset(@Param('id') id: string) {
    return this.libraryAssetsService.getIssueAsset(id);
  }

  @ApiOperation({ summary: 'Book Issuance' })
  @ApiResponse({
    status: 400,
    description: 'Borrower not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Issuer not found',
  })
  @ApiResponse({
    status: 402,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Book is already issued.',
  })
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('issuance')
  async setIssueAsset(
    @Body() createBookIssuanceDto: CreateAssetIssuanceDto,
    @Req() { payload },
  ) {
    return this.libraryAssetsService.setIssueAsset(
      createBookIssuanceDto,
      payload,
    );
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('reissuance/:id')
  async getReIssuance(@Param('id') id: string) {
    return this.libraryAssetsService.getReIssuance(id);
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('reissuance/:id')
  async setReIssuance(@Param('id') id: string, @Req() { payload }) {
    return this.libraryAssetsService.setReIssuance(id, payload);
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Magzine Return UnderConstruction' })
  @Get('return/:id')
  async getReturnAsset(@Param('id') id: string) {
    return await this.libraryAssetsService.getReturnAsset(id);
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Magzine Return UnderConstruction' })
  @Patch('return/:id')
  async setReturnAsset(
    @Param('id') id: string,
    @Body() createReturnBookDto: CreateReturnAssetDto,
    @Req() { payload },
  ) {
    return this.libraryAssetsService.setReturnAsset(
      id,
      createReturnBookDto,
      payload,
    );
  }
  @ROLES(['user'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Currently Issued, Re-Issued and Returned Assets' })
  @Get('borrowerDashboard')
  async currentlyIssuedAssets(@Req() { payload }) {
    const issued = await this.libraryAssetsService.issuedAssets({
      sub: payload.sub,
    });
    const reIssued = await this.libraryAssetsService.reIssuedAssets({
      sub: payload.sub,
    });
    const returned = await this.libraryAssetsService.issuedAssetsHistory({
      sub: payload.sub,
    });

    const getTenNewArrivals =
      await this.libraryAssetsService.getTenNewArrivals();
    const dataCounts = await this.libraryAssetsService.userDashboardData({
      sub: payload.sub,
    });

    const data = {
      getTenNewArrivals,
      dataCounts,
      issued,
      reIssued,
      returned,
    };
    return data;
  }

  @ApiOperation({
    summary:
      'Currently Issued By, Re-Issued By, Issued By History, Re-issued By History and Return By  By Librarian',
  })
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('librarianDashboard')
  async issuedAssetsBy(@Req() { payload }) {
    const issuedBy = await this.libraryAssetsService.issuedAssetsBy({
      sub: payload.sub,
    });
    const reIssuedBy = await this.libraryAssetsService.reIssuedAssetsBy({
      sub: payload.sub,
    });
    const issuedByHistory =
      await this.libraryAssetsService.issuedAssetsByHistory({
        sub: payload.sub,
      });

    const reIssuedByHistory =
      await this.libraryAssetsService.reIssuedAssetsByHistory({
        sub: payload.sub,
      });
    const returnByHistory =
      await this.libraryAssetsService.returnAssetsByHistory({
        sub: payload.sub,
      });

    const getTenNewArrivals =
      await this.libraryAssetsService.getTenNewArrivals();
    const dataCounts = await this.libraryAssetsService.librarianDashboardData();
    const data = {
      getTenNewArrivals,
      dataCounts,
      issuedBy,
      reIssuedBy,
      issuedByHistory,
      reIssuedByHistory,
      returnByHistory,
    };
    return data;
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('borrowedAssetsList')
  async borrowedAssetsList(@Query() pageOptionsDto: PageOptionsDto) {
    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (!pageOptionsDto.search) {
      pageOptionsDto.search = '';
    }

    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }

    const pagedata = await this.libraryAssetsService.borrowedAssetsList(
      pageOptionsDto,
    );
    return pagedata;
  }
  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('returnedAssetsList')
  async returnedAssetsList(@Query() pageOptionsDto: PageOptionsDto) {
    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (!pageOptionsDto.search) {
      pageOptionsDto.search = '';
    }

    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }

    const pagedata = await this.libraryAssetsService.returnedAssetsList(
      pageOptionsDto,
    );
    return pagedata;
  }
}
