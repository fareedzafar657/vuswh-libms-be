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
  UseGuards,
} from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { DESIGNATION_SERVICE, ROLES } from 'src/common/constants';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Designation } from 'src/db/entities/designation.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
@ROLES(['admin'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Designations')
@Controller('designations')
export class DesignationsController {
  constructor(
    @Inject(DESIGNATION_SERVICE)
    private readonly designationsService: DesignationsService,
  ) {}

  @ApiOperation({ summary: 'Create Designations' })
  @ApiResponse({
    status: 201,
    description: 'Designation created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not saved or Duplicate Entry',
  })
  @Post('create')
  async create(@Body() createDesignationDto: CreateDesignationDto) {
    const createdDesignation = await this.designationsService.create(
      createDesignationDto,
    );
    if (!createdDesignation) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }

    return 'Designation Successfully Created';
  }

  @ApiOperation({ summary: 'PageData Designations' })
  @ApiResponse({
    status: 200,
    description: 'List of Designations',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          example: [
            {
              id: 'fb8b00bc-83ab-11ee-b22b-8cec4bd509eb',
              name: 'Assistant Professor',
            },
            {
              id: 'fb8afeb9-83ab-11ee-b22b-8cec4bd509eb',
              name: 'Associate Professor',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No Record Found',
  })
  @Get('pagedata')
  // @UsePipes(ValidationPipe)
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Designation>> {
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
    const pageDto = await this.designationsService.getAllPageData(
      pageOptionsDto,
    );
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Update Designations' })
  @ApiResponse({
    status: 200,
    description: 'Designation Record',
  })
  @Get('update/:id')
  async getUpdate(@Param('id') id: string) {
    const updatedDesignation = await this.designationsService.getUpdate(id);

    const data = {
      id: updatedDesignation.id,
      name: updatedDesignation.name,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update Designations' })
  @ApiResponse({
    status: 201,
    description: 'Designation updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not saved or User not exist',
  })
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDesignationDto: UpdateDesignationDto,
  ) {
    const updatedDesignation = await this.designationsService.update(
      id,
      updateDesignationDto,
    );
    if (!updatedDesignation) {
      throw new HttpException('Record not saved.', HttpStatus.NOT_FOUND);
    }
    const data = {
      id: updatedDesignation.id,
      name: updatedDesignation.name,
    };
    return data;
  }

  @ApiOperation({ summary: 'Delete Designations' })
  @ApiResponse({
    status: 201,
    description: 'Successfully deleted',
  })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.designationsService.remove(id);
  }
}
