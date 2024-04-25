import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Inject,
  HttpStatus,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import {
  AUTHOR_SERVICE,
  CATEGORY_SERVICE,
  CURRENCY_SERVICE,
  LANGUAGE_SERVICE,
  LOCATION_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  ROLES,
} from 'src/common/constants';
import { CategoriesService } from '../categories/categories.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { PublishersService } from '../publishers/publishers.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { Repository } from 'typeorm';
import { PageDto } from 'src/common/dto/page.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { CurrenciesService } from '../currencies/currencies.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { multerOptions } from 'src/common/multerconfig';
import { AuthorsService } from '../authors/authors.service';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Novels')
@Controller('novels')
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    @InjectRepository(Asset)
    private readonly novelRepository: Repository<Asset>,
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
    @Inject(AUTHOR_SERVICE)
    private readonly _authorService: AuthorsService,
  ) {}

  @ApiOperation({ summary: 'getCreate Novels' })
  @Get('create')
  async getCreate() {
    const categories = await this._categoryService.lookup();
    const publishers = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const locations = await this._locationService.lookup();
    const currencies = await this._currencyService.lookup();
    const authorsLookup = await this._authorService.lookup();
    const authorsArray = authorsLookup.map((authors) => authors.name);
    const authors = Array.from(new Set(authorsArray));

    const data = {
      authors,
      categories,
      publishers,
      distributers,
      material_types,
      languages,
      locations,
      currencies,
    };
    return data;
  }

  @ApiOperation({ summary: 'Create Novels' })
  @Post('create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createNovelDto: CreateNovelDto,
    @Req() { payload },
  ) {
    try {
      const createdRecord = await this.novelsService.create(
        createNovelDto,
        file,
        payload,
      );
      return createdRecord;
    } catch (error) {
      fs.unlinkSync(file.path);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update Novel' })
  @Get('update/:id')
  async getupdate(@Param('id') id: string) {
    const updateRecord = await this.novelsService.getUpdate(id);
    const authorsLookup = await this._authorService.lookup();
    const authorsArray = authorsLookup.map((authors) => authors.name);
    const authors = Array.from(new Set(authorsArray));
    const categoriesData = await this._categoryService.lookup();
    const publishersData = await this._publisherService.lookup();
    const distributorsData = await this._publisherService.lookup();
    const languagesData = await this._languageService.lookup();
    const locationsData = await this._locationService.lookup();
    const material_typesData = await this._materialTypeService.lookup();
    const currencyData = await this._currencyService.lookup();

    const data = {
      authors: authors,
      novelRecord: updateRecord,
      categories: categoriesData,
      publishers: publishersData,
      distributors: distributorsData,
      languages: languagesData,
      locations: locationsData,
      material_types: material_typesData,
      currencies: currencyData,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update Novel' })
  @Patch('update/:id') // Assuming you pass the magazine ID in the URL
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateMagazine(
    @Param('id') id: string, // Assuming you get the magazine ID from the URL
    @UploadedFile() file: Express.Multer.File,
    @Body() updateNovelDto: UpdateNovelDto, // Define your DTO for updating a magazine
    @Req() { payload },
  ) {
    try {
      const updatedRecord = await this.novelsService.setUpdate(
        id,
        updateNovelDto,
        payload,
        file,
      );

      return updatedRecord;
    } catch (error) {
      fs.unlinkSync(file.path); // Delete the uploaded file in case of an error
      throw error;
    }
  }

  @ApiOperation({ summary: 'Novel pageData' })
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
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }
    const pagedata = await this.novelsService.getAllPageData(
      req,
      pageOptionsDto,
    );
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

  @ApiOperation({ summary: 'Lookup Novels' })
  @Get('lookup')
  lookup() {
    return this.novelsService.lookup();
  }

  @ApiOperation({ summary: 'Delete Novels' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() { payload }) {
    return this.novelsService.remove(id, payload);
  }
}
