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
  UseGuards,
} from '@nestjs/common';
import { MaterialTypeService } from './material_type.service';
import { CreateMaterialTypeDto } from './dto/create-material_type.dto';
import { UpdateMaterialTypeDto } from './dto/update-material_type.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { MaterialType } from 'src/db/entities/material_type.entity';
import { MATERIAL_TYPE_SERVICE, ROLES } from 'src/common/constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('MaterialType')
@Controller('materialtypes')
export class MaterialTypeController {
  constructor(
    @Inject(MATERIAL_TYPE_SERVICE)
    private readonly materialTypeService: MaterialTypeService,
  ) {}

  @ApiOperation({ summary: 'Create Magzine' })
  @Post('create')
  async create(@Body() createMaterialTypeDto: CreateMaterialTypeDto) {
    const materialTypeRecord = await this.materialTypeService.create(
      createMaterialTypeDto,
    );
    if (!materialTypeRecord) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }

    return 'Material Type Successfully Created';
  }

  @ApiOperation({ summary: 'Lookup MaterialType' })
  @Get('lookup')
  lookup() {
    return this.materialTypeService.lookup();
  }

  @ApiOperation({ summary: 'getPageData MaterialType' })
  @Get('pagedata')
  // @UsePipes(ValidationPipe)
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<MaterialType>> {
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
    const pageDto = await this.materialTypeService.getAllPageData(
      pageOptionsDto,
    );
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'getListById MaterialType' })
  @Get('pagedata/:id')
  findOne(@Param('id') id: string) {
    return this.materialTypeService.findOne(id);
  }

  @ApiOperation({ summary: 'getUpdateById MaterialType' })
  @Get('update/:id')
  getUpdate(@Param('id') id: string) {
    return this.materialTypeService.getUpdate(id);
  }

  @ApiOperation({ summary: 'getUpdateById MaterialType' })
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateMaterialTypeDto: UpdateMaterialTypeDto,
  ) {
    return this.materialTypeService.update(id, updateMaterialTypeDto);
  }

  @ApiOperation({ summary: 'Delete MaterialType' })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.materialTypeService.remove(id);
  }
}
