import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  HttpException,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { MagazinesService } from './magazines.service';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import {
  CATEGORY_SERVICE,
  CURRENCY_SERVICE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  ROLES,
} from 'src/common/constants';
import { CategoriesService } from '../categories/categories.service';
import { PublishersService } from '../publishers/publishers.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Asset } from 'src/db/entities/assets.entity';
import { CurrenciesService } from '../currencies/currencies.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { multerOptions } from 'src/common/multerconfig';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Magazines')
@Controller('magazines')
export class MagazinesController {
  constructor(
    private readonly magazinesService: MagazinesService,
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
  ) {}

  @ROLES(['librarian'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'getCreate Magzine' })
  @Get('create')
  async getCreate() {
    const publishersData = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const languagesData = await this._languageService.lookup();
    const locationsData = await this._locationService.lookup();
    const material_typesData = await this._materialTypeService.lookup();
    const currencyData = await this._currencyService.lookup();
    const data = {
      publishers: publishersData,
      distributors: distributers,
      languages: languagesData,
      locations: locationsData,
      material_types: material_typesData,
      currencies: currencyData,
    };
    return data;
  }

  @ApiOperation({ summary: 'Create Magzine' })
  @Post('create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMagazineDto: CreateMagazineDto,
    @Req() { payload },
  ) {
    try {
      const createdRecord = await this.magazinesService.create(
        createMagazineDto,
        file,
        payload,
      );
      return createdRecord;
    } catch (error) {
      fs.unlinkSync(file.path);
      throw error;
    }
  }

  @ApiOperation({ summary: 'PageData Magazine' })
  @Get('pagedata')
  async getAllPageData(
    @Req() req: Request,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const publishers = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const locations = await this._locationService.lookup();

    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
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
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }
    const pagedata = await this.pageData(req, pageOptionsDto);
    const data = {
      pagedata,
      publishers,
      distributers,
      material_types,
      languages,
      locations,
    };
    return data;
  }

  async pageData(@Req() req: Request, @Query() pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.magazinesService.getAllPageData(
      req,
      pageOptionsDto,
    );
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Update Magzine' })
  @Get('update/:id')
  async getupdate(@Param('id') id: string) {
    const updateRecord = await this.magazinesService.getUpdate(id);

    const publishersData = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const languagesData = await this._languageService.lookup();
    const locationsData = await this._locationService.lookup();
    const material_typesData = await this._materialTypeService.lookup();
    const currencyData = await this._currencyService.lookup();

    const data = {
      magazineRecord: updateRecord,
      publishers: publishersData,
      distributors: distributers,
      languages: languagesData,
      locations: locationsData,
      material_types: material_typesData,
      currencies: currencyData,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update Magazine' })
  @Patch('update/:id') // Assuming you pass the magazine ID in the URL
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateMagazine(
    @Param('id') id: string, // Assuming you get the magazine ID from the URL
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMagazineDto: UpdateMagazineDto, // Define your DTO for updating a magazine
    @Req() { payload },
  ) {
    try {
      const updatedRecord = await this.magazinesService.setUpdate(
        id,
        updateMagazineDto,
        payload,
        file,
      );
      return updatedRecord;
    } catch (error) {
      fs.unlinkSync(file.path); // Delete the uploaded file in case of an error
      throw error;
    }
  }

  @ApiOperation({ summary: 'Delete Magazine' })
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() { payload }) {
    return this.magazinesService.remove(id, payload);
  }
}
