import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import {
  AUTHOR_SERVICE,
  CURRENCY_SERVICE,
  DEPARTMENT_SERVICE,
  LANGUAGE_SERVICE,
  MATERIAL_TYPE_SERVICE,
  PUBLISHER_SERVICE,
  ROLES,
} from 'src/common/constants';
import { PublishersService } from '../publishers/publishers.service';
import { MaterialTypeService } from '../material_type/material_type.service';
import { LanguagesService } from '../languages/languages.service';
import { DepartmentsService } from '../departments/departments.service';
import { AuthorsService } from '../authors/authors.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import * as fs from 'fs';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiOperation } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import { multerOptions } from 'src/common/multerconfig';
import { multerMultiplesOptions } from 'src/common/multerconfigForMultipleFiles';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('ebooks')
export class EbooksController {
  constructor(
    @InjectRepository(Asset)
    private readonly ebookRepository: Repository<Asset>,
    private readonly ebooksService: EbooksService,
    @Inject(PUBLISHER_SERVICE)
    private readonly _publisherService: PublishersService,
    @Inject(MATERIAL_TYPE_SERVICE)
    private readonly _materialTypeService: MaterialTypeService,
    @Inject(LANGUAGE_SERVICE)
    private readonly _languageService: LanguagesService,
    @Inject(DEPARTMENT_SERVICE)
    private readonly _departmentService: DepartmentsService,
    @Inject(AUTHOR_SERVICE)
    private readonly _authorService: AuthorsService,
    @Inject(CURRENCY_SERVICE)
    private readonly _currencyService: CurrenciesService,
  ) {}

  @ApiOperation({ summary: 'getCreate eBook' })
  @Get('create')
  async getCreate() {
    const publishers = await this._publisherService.lookup();
    const distributors = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const departments = await this._departmentService.lookup();
    const authorsLookup = await this._authorService.lookup();
    const authorsArray = authorsLookup.map((authors) => authors.name);
    const authors = Array.from(new Set(authorsArray));
    const currencies = await this._currencyService.lookup();
    const data = {
      publishers,
      distributors,
      material_types,
      languages,
      departments,
      authors,
      currencies,
    };
    return data;
  }

  @ApiOperation({ summary: 'setCreate eBook' })
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
      ],
      multerMultiplesOptions,
    ),
  )
  async create(
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() createEbookDto: CreateEbookDto,
    @Req() { payload },
  ) {
    const { cover, pdf } = files;
    let coverPath = null;
    if (cover) {
      coverPath = `\\images\\${cover[0].filename}`;
    } else {
      coverPath = '\\avatar\\noImage.jpg';
    }
    let pdfPath = null;
    if (pdf) {
      pdfPath = `\\pdf\\${pdf[0].filename}`;
    }
    try {
      const createdRecord = await this.ebooksService.setCreate(
        createEbookDto,
        coverPath,
        pdfPath,
        payload,
      );

      return createdRecord;
    } catch (error) {
      if (coverPath !== '\\avatar\\noImage.jpg') {
        fs.unlinkSync(cover[0].path);
      }
      fs.unlinkSync(pdf[0].path);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update eBook' })
  @Get('update/:id')
  async getupdate(@Param('id') id: string) {
    const updateRecord = await this.ebooksService.getUpdate(id);
    const authorsLookup = await this._authorService.lookup();
    const authorsArray = authorsLookup.map((authors) => authors.name);
    const authors = Array.from(new Set(authorsArray));
    const publishersData = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const languagesData = await this._languageService.lookup();
    const material_typesData = await this._materialTypeService.lookup();
    const currencyData = await this._currencyService.lookup();
    const departmentsData = await this._departmentService.lookup();

    const data = {
      authors: authors,
      bookRecord: updateRecord,
      publishers: publishersData,
      distributors: distributers,
      languages: languagesData,
      material_types: material_typesData,
      currencies: currencyData,
      departments: departmentsData,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update eBook' })
  @Patch('update/:id') // Assuming you pass the magazine ID in the URL
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
      ],
      multerMultiplesOptions,
    ),
  )
  async updateBook(
    @Param('id') id: string, // Assuming you get the magazine ID from the URL
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() updateEbookDto: UpdateEbookDto, // Define your DTO for updating a magazine
    @Req() { payload },
  ) {
    const { cover, pdf } = files;
    let coverPath = null;
    if (cover) {
      coverPath = `\\images\\${cover[0].filename}`;
    }
    let pdfPath = null;
    if (pdf) {
      pdfPath = `\\pdf\\${pdf[0].filename}`;
    }
    try {
      const updatedRecord = await this.ebooksService.setUpdate(
        id,
        updateEbookDto,
        payload,
        coverPath,
        pdfPath,
      );
      return updatedRecord;
    } catch (error) {
      if (cover) {
        fs.unlinkSync(cover[0].path);
      }
      if (pdf) {
        fs.unlinkSync(pdf[0].path);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Book pageData' })
  @Get('pagedata')
  async getAllPageData(@Query() pageOptionsDto: PageOptionsDto) {
    const publishers = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const departments = await this._departmentService.lookup();
    const authorsArray = await this._authorService.lookup();
    const authors = new Set(authorsArray);

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
    if (!pageOptionsDto.author) {
      pageOptionsDto.author = '';
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

    const pageData = await this.ebooksService.getAllPageData(pageOptionsDto);
    if (pageData) {
      const data = {
        pageData,
        publishers,
        distributers,
        material_types,
        languages,
        authors,
        departments,
      };
      return data;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Delete eBook' })
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() { payload }) {
    return this.ebooksService.remove(id, payload);
  }
}
