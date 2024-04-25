import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { Language } from 'src/db/entities/language.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  lookup() {
    return this.languageRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getLanguagesById(id: string) {
    return await this.languageRepository.find({
      where: {
        id: id,
      },
    });
  }

  async create(_createLanguageDto: CreateLanguageDto) {
    try {
      const savingRecord = await this.languageRepository.save(
        _createLanguageDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const languageRecord = await this.languageRepository.findOne({
          where: { name: _createLanguageDto.name },
          withDeleted: true,
        });
        if (languageRecord.archived_at) {
          return await this.languageRepository.update(
            { id: languageRecord.id },
            { name: _createLanguageDto.name, archived_at: null },
          );
        } else {
          throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
        }
      }
      throw error;
    }
  }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Language>> {
    const queryBuilder = this.languageRepository.createQueryBuilder('language');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('language.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('language.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('language.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['language.id', 'language.name']); // added selection
    if (pageOptionsDto.search) {
      queryBuilder.where('language.name LIKE :name', {
        name: `%${pageOptionsDto.search}%`,
      });
    }
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Language>(entities, pageMetaDto);
  }

  findOne(id: string) {
    return this.languageRepository.findOne({ where: { id } });
  }

  async getUpdate(id: string) {
    const record = await this.languageRepository.findOne({ where: { id } });
    if (!record) {
      throw new HttpException('language Not Exists', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  async update(id: string, updateLanguageDto: UpdateLanguageDto) {
    const languageRecord = await this.languageRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!languageRecord) {
      throw new HttpException('User Not Exists', HttpStatus.NOT_FOUND);
    }
    languageRecord.name = updateLanguageDto.name;

    return await this.languageRepository.save(languageRecord);
  }

  async remove(id: string) {
    return await this.languageRepository
      .createQueryBuilder('languages')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
  }
}
