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
import { PublishersService } from './publishers.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Publisher } from 'src/db/entities/publisher.entity';
import { PUBLISHER_SERVICE, ROLES } from 'src/common/constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Publisher')
@Controller('publishers')
export class PublishersController {
  constructor(
    @Inject(PUBLISHER_SERVICE)
    private readonly publishersService: PublishersService,
  ) {}

  @ApiOperation({ summary: 'Create Publisher' })
  @Post('create')
  async create(@Body() createPublisherDto: CreatePublisherDto) {
    const publisherRecord = await this.publishersService.create(
      createPublisherDto,
    );
    if (!publisherRecord) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }

    return 'Publisher Successfully Created';
  }

  @Get('lookup')
  lookup() {
    return this.publishersService.lookup();
  }

  @ApiOperation({ summary: 'getPageData Publisher' })
  @Get('pagedata')
  // @UsePipes(ValidationPipe)
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Publisher>> {
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
    const pageDto = await this.publishersService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @Get('update/:id')
  getUpdate(@Param('id') id: string) {
    return this.publishersService.getUpdate(id);
  }

  @ApiOperation({ summary: 'Update Publisher' })
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updatePublisherDto: UpdatePublisherDto,
  ) {
    return this.publishersService.update(id, updatePublisherDto);
  }

  @ApiOperation({ summary: 'Delete Publisher' })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.publishersService.remove(id);
  }
}
