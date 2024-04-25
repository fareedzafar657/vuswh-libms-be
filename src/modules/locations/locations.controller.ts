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
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LOCATION_SERVICE, ROLES } from 'src/common/constants';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Location } from 'src/db/entities/location.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ROLES(['admin'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(
    @Inject(LOCATION_SERVICE)
    private readonly locationsService: LocationsService,
  ) {}

  @ApiOperation({ summary: 'Create Locations' })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Record not saved',
  })
  @ApiResponse({
    status: 401,
    description: 'Duplicate Entry',
  })
  @Post('create')
  async create(@Body() createLocationDto: CreateLocationDto) {
    const createdLocation = await this.locationsService.create(
      createLocationDto,
    );
    if (!createdLocation) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }
    return 'Library Successfully Created';
  }

  @ApiResponse({
    status: 200,
    description: 'List of Locations',
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
              id: '3735bf6f-592c-11ee-a96d-90b11c6fb389',
              name: 'LRO-Office',
            },
            {
              id: '373a63b5-592c-11ee-a96d-90b11c6fb389',
              name: 'Rawalpindi Office',
            },
          ],
        },
      },
    },
  })
  @ApiOperation({ summary: 'PageData Locations' })
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
  @Get('pagedata')
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Location>> {
    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }

    return await this.pageData(pageOptionsDto);
  }

  async pageData(pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.locationsService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiResponse({
    status: 404,
    description: 'No Record Found.',
  })
  @ApiResponse({
    status: 404,
    description: 'Locatins not Found.',
  })
  @Get('update/:id')
  async getUpdate(@Param('id') id: string) {
    const updateRecord = await this.locationsService.getUpdate(id);
    return updateRecord;
  }

  @ApiResponse({
    status: 404,
    description: 'No Record Found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Record not saved.',
  })
  @ApiOperation({ summary: 'Update Location' })
  @ApiResponse({
    status: 400,
    description: 'Record not updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Location Not Exists',
  })
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const updatedLocation = await this.locationsService.update(
      id,
      updateLocationDto,
    );
    if (!updatedLocation) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }
    return;
  }
  @ApiResponse({
    status: 200,
    description: 'Location archived successfully.',
  })
  @ApiOperation({ summary: 'Delete Location' })
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
