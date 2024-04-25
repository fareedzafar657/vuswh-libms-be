import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Category } from 'src/db/entities/category.entity';
import { CATEGORY_SERVICE, ROLES } from 'src/common/constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject(CATEGORY_SERVICE)
    private readonly categoriesService: CategoriesService,
  ) {}

  // @ApiOperation({ summary: 'Create Categories' })
  // @Post('Create')
  // create(@Body() createCategoryDto: CreateCategoryDto) {
  //   const createsCategoryDto = this.categoriesService.create(createCategoryDto);

  //   if (!createsCategoryDto) {
  //     throw new HttpException('Category not created', HttpStatus.BAD_REQUEST);
  //   } else return createsCategoryDto;
  // }

  @Get('lookup')
  lookup() {
    return this.categoriesService.lookup();
  }

  @ApiOperation({ summary: 'getPageData Categories' })
  @Get('pagedata')
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Category>> {
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
    return await this.pageData(pageOptionsDto);
  }

  async pageData(pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.categoriesService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  // @Get('pagedata/:id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(id);
  // }

  // @ApiOperation({ summary: 'Update Categories' })
  // @Patch('update/:id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   const updatesCategoryDto = this.categoriesService.update(
  //     id,
  //     updateCategoryDto,
  //   );
  //   if (!updatesCategoryDto) {
  //     throw new HttpException('Category Not Modified', HttpStatus.NOT_MODIFIED);
  //   } else return updatesCategoryDto;
  // }

  // @ApiOperation({ summary: 'Delete Categories' })
  // @Delete('delete/:id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(id);
  // }
}
