import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from 'src/db/entities/currency.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}
  async create(createCurrencyDto: CreateCurrencyDto) {
    try {
      const savingRecord = await this.currencyRepository.save(
        createCurrencyDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const currencyRecord = await this.currencyRepository.findOne({
          where: { name: createCurrencyDto.name },
          withDeleted: true,
        });
        if (currencyRecord.archived_at) {
          return await this.currencyRepository.update(
            { id: currencyRecord.id },
            { name: createCurrencyDto.name, archived_at: null },
          );
        } else {
          throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
        }
      }
      throw error;
    }
  }

  lookup() {
    return this.currencyRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  findOne(id: string) {
    return this.currencyRepository.findOne({ where: { id } });
  }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Currency>> {
    const queryBuilder = this.currencyRepository.createQueryBuilder('currency');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('currency.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('currency.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('currency.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['currency.id', 'currency.name']); // added selection

    // queryBuilder.where('designation.name LIKE :keyword', {
    //   keyword: `%${pageOptionsDto.search}%`,
    // });
    if (pageOptionsDto.search) {
      queryBuilder.where('currency.name LIKE :name', {
        name: `%${pageOptionsDto.search}%`,
      });
    }
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Currency>(entities, pageMetaDto);
  }

  async getUpdate(id: string) {
    const record = await this.currencyRepository.findOne({ where: { id } });
    if (!record) {
      throw new HttpException('No Record found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  async update(id: string, updateCurrencyDto: UpdateCurrencyDto) {
    const currencyRecord = await this.currencyRepository.findOne({
      where: { id },
    });
    currencyRecord.name = updateCurrencyDto.name;

    return this.currencyRepository.save(currencyRecord);
  }

  remove(id: string) {
    return this.currencyRepository
      .createQueryBuilder('currencies')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
  }
}
