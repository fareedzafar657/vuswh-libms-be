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
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
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
import { MaterialTypeService } from '../material_type/material_type.service';
import { LanguagesService } from '../languages/languages.service';
import { LocationsService } from '../locations/locations.service';
import { Asset } from 'src/db/entities/assets.entity';
import { PageDto } from 'src/common/dto/page.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { multerOptions } from 'src/common/multerconfig';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Journals')
@Controller('journals')
export class JournalsController {
  constructor(
    private readonly journalsService: JournalsService,
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
  ) {}

  @Get('create')
  async getCreate() {
    const publishers = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const locations = await this._locationService.lookup();
    const currency = await this._currencyService.lookup();

    const data = {
      publishers,
      distributers,
      material_types,
      languages,
      locations,
      currency,
    };
    return data;
  }
  @ApiOperation({ summary: 'Journal Create' })
  @Post('create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async setCreate(
    @UploadedFile() file: Express.Multer.File,
    @Body() createJournalDto: CreateJournalDto,
    @Req() { payload },
  ) {
    try {
      const createdRecord = await this.journalsService.create(
        createJournalDto,
        file,
        payload,
      );
      if (!createdRecord) {
        throw new HttpException('Record not saved', HttpStatus.BAD_REQUEST);
      }

      return createdRecord;
    } catch (error) {
      fs.unlinkSync(file.path);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update Journal' })
  @Patch('update/:id') // Assuming you pass the magazine ID in the URL
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateJournal(
    @Param('id') id: string, // Assuming you get the magazine ID from the URL
    @UploadedFile() file: Express.Multer.File,
    @Body() updateJournalDto: UpdateJournalDto, // Define your DTO for updating a magazine
    @Req() { payload },
  ) {
    try {
      const updatedRecord = await this.journalsService.setUpdate(
        id,
        updateJournalDto,
        payload,
        file,
      );
      if (!updatedRecord) {
        throw new HttpException('Record not updated', HttpStatus.BAD_REQUEST);
      }

      return updatedRecord;
    } catch (error) {
      fs.unlinkSync(file.path); // Delete the uploaded file in case of an error
      throw error;
    }
  }

  @ApiOperation({ summary: 'Journal pageData' })
  @Get('pagedata')
  async getAllPageData(
    @Param('id') id: string,
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
    const pagedata = await this.journalsService.getAllPageData(
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

  @ApiOperation({ summary: 'Journal getUpdate' })
  @Get('update/:id')
  async getupdate(@Param('id') id: string) {
    const updateRecord = await this.journalsService.getUpdate(id);
    const publishersData = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const languagesData = await this._languageService.lookup();
    const locationsData = await this._locationService.lookup();
    const material_typesData = await this._materialTypeService.lookup();
    const currencyData = await this._currencyService.lookup();
    const data = {
      journalRecord: updateRecord,
      publishers: publishersData,
      distributors: distributers,
      languages: languagesData,
      locations: locationsData,
      material_types: material_typesData,
      currencies: currencyData,
    };
    return data;
  }

  @ApiOperation({ summary: 'Journal Delete' })
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() { payload }) {
    return this.journalsService.remove(id, payload);
  }
}
