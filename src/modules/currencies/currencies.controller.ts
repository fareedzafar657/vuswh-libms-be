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
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CURRENCY_SERVICE, ROLES } from 'src/common/constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Currency } from 'src/db/entities/currency.entity';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ROLES(['librarian'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(
    @Inject(CURRENCY_SERVICE)
    private readonly currenciesService: CurrenciesService,
  ) {}

  @ApiOperation({ summary: 'Create Currencies' })
  @Post('create')
  async create(@Body() createCurrencyDto: CreateCurrencyDto) {
    const currencyRecord = await this.currenciesService.create(
      createCurrencyDto,
    );
    if (!currencyRecord) {
      throw new HttpException('Record not saved.', HttpStatus.BAD_REQUEST);
    }
    return 'Currency Successfully Created';
  }

  @ApiOperation({ summary: 'Lookup Currencies' })
  @Get('lookup')
  lookup() {
    return this.currenciesService.lookup();
  }

  @ApiOperation({ summary: 'PageData Currencies' })
  @ApiResponse({
    status: 200,
    description: 'List of Currencies',
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
              name: 'USD',
            },
            {
              id: 'fb8afeb9-83ab-11ee-b22b-8cec4bd509eb',
              name: 'PKR',
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
  ): Promise<PageDto<Currency>> {
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
    const pageDto = await this.currenciesService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'getUpdateById Currency' })
  @Get('update/:id')
  getUpdate(@Param('id') id: string) {
    return this.currenciesService.getUpdate(id);
  }

  @ApiOperation({ summary: 'Update Currencies' })
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @ApiOperation({ summary: 'Delete Currencies' })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.currenciesService.remove(id);
  }
}
