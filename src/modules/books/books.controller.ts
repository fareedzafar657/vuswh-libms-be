import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Inject,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  StreamableFile,
  Res,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import {
  AUTHOR_SERVICE,
  CATEGORY_SERVICE,
  CURRENCY_SERVICE,
  DEPARTMENT_SERVICE,
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
import { DepartmentsService } from '../departments/departments.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { CurrenciesService } from '../currencies/currencies.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthorsService } from '../authors/authors.service';
import { multerOptions } from 'src/common/multerconfig';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
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
    @Inject(AUTHOR_SERVICE)
    private readonly _authorService: AuthorsService,
    @Inject(CURRENCY_SERVICE)
    private readonly _currencyService: CurrenciesService,
  ) {}

  @ApiOperation({ summary: 'Create Book' })
  @Post('Create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
    @Req() { payload },
  ) {
    try {
      const createdRecord = await this.booksService.create(
        createBookDto,
        file,
        payload,
      );
      return createdRecord;
    } catch (error) {
      fs.unlinkSync(file.path);
      throw error;
    }
  }
  @ApiOperation({ summary: 'getCreate Book' })
  @Get('create')
  async getCreate() {
    const publishers = await this._publisherService.lookup();
    const distributors = await this._publisherService.lookup();
    const material_types = await this._materialTypeService.lookup();
    const languages = await this._languageService.lookup();
    const locations = await this._locationService.lookup();
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
      locations,
      departments,
      authors,
      currencies,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update Book' })
  @Get('update/:id')
  async getupdate(@Param('id') id: string) {
    const updateRecord = await this.booksService.getUpdate(id);
    const authorsLookup = await this._authorService.lookup();
    const authorsArray = authorsLookup.map((authors) => authors.name);
    const authors = Array.from(new Set(authorsArray));
    const categoriesData = await this._categoryService.lookup();
    const publishersData = await this._publisherService.lookup();
    const distributers = await this._publisherService.lookup();
    const languagesData = await this._languageService.lookup();
    const locationsData = await this._locationService.lookup();
    const material_typesData = await this._materialTypeService.lookup();
    const currencyData = await this._currencyService.lookup();
    const departmentsData = await this._departmentService.lookup();

    const data = {
      authors: authors,
      bookRecord: updateRecord,
      categories: categoriesData,
      publishers: publishersData,
      distributors: distributers,
      languages: languagesData,
      locations: locationsData,
      material_types: material_typesData,
      currencies: currencyData,
      departments: departmentsData,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update Book' })
  @Patch('update/:id') // Assuming you pass the magazine ID in the URL
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateBook(
    @Param('id') id: string, // Assuming you get the magazine ID from the URL
    @UploadedFile()
    file: Express.Multer.File,
    @Body() updateBookDto: UpdateBookDto, // Define your DTO for updating a magazine
    @Req() { payload },
  ) {
    try {
      const updatedRecord = await this.booksService.setUpdate(
        id,
        updateBookDto,
        payload,
        file,
      );
      return updatedRecord;
    } catch (error) {
      fs.unlinkSync(file.path); // Delete the uploaded file in case of an error
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
    const locations = await this._locationService.lookup();
    const departments = await this._departmentService.lookup();
    const authorsArray = await this._authorService.lookup();
    const authorsSet = new Set(authorsArray);
    const authors = Array.from(authorsSet);

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
    if (!pageOptionsDto.author) {
      pageOptionsDto.author = '';
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
      publishers,
      distributers,
      material_types,
      languages,
      locations,
      authors,
      departments,
    };
    return data;
  }

  async pageData(@Query() pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.booksService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Delete Book' })
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() { payload }) {
    return this.booksService.remove(id, payload);
  }
}
