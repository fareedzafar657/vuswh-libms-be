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
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Language } from 'src/db/entities/language.entity';
import { LANGUAGE_SERVICE, ROLES } from 'src/common/constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(
    @Inject(LANGUAGE_SERVICE)
    private readonly languagesService: LanguagesService,
  ) {}

  @ApiOperation({ summary: 'Language Add' })
  @Post('create')
  async create(@Body() createLanguageDto: CreateLanguageDto) {
    const languageRecord = await this.languagesService.create(
      createLanguageDto,
    );
    if (!languageRecord) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }

    return 'Language Successfully Created';
  }

  @Get('lookup')
  lookup() {
    return this.languagesService.lookup();
  }

  @ApiOperation({ summary: 'Languages PageData' })
  @Get('pagedata')
  // @UsePipes(ValidationPipe)
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Language>> {
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
    const pageDto = await this.languagesService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Language Update' })
  @Get('update/:id')
  getUpdate(@Param('id') id: string) {
    return this.languagesService.getUpdate(id);
  }

  @ApiOperation({ summary: 'Language Update' })
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.languagesService.update(id, updateLanguageDto);
  }

  @ApiOperation({ summary: 'Language Delete' })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.languagesService.remove(id);
  }
}
