import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Publisher } from 'src/db/entities/publisher.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  lookup() {
    return this.publisherRepository.find({
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    });
  }

  async getPublisherById(id: string) {
    return await this.publisherRepository.find({
      where: {
        id: id,
      },
    });
  }

  async create(createPublisherDto: CreatePublisherDto) {
    try {
      const savingRecord = await this.publisherRepository.save(
        createPublisherDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const publisherRecord = await this.publisherRepository.findOne({
          where: { name: createPublisherDto.name },
          withDeleted: true,
        });
        if (publisherRecord.archived_at) {
          return await this.publisherRepository.update(
            { id: publisherRecord.id },
            { name: createPublisherDto.name, archived_at: null },
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
  ): Promise<PageDto<Publisher>> {
    const queryBuilder =
      this.publisherRepository.createQueryBuilder('publisher');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('publisher.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('publisher.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('publisher.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['publisher.id', 'publisher.name']); // added selection
    queryBuilder
      .where('publisher.name LIKE :keyword', {
        keyword: `%${pageOptionsDto.search}%`,
      })
      .andWhere('publisher.archived_at IS NULL');
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Publisher>(entities, pageMetaDto);
  }

  findOne(id: string) {
    return this.publisherRepository.findOne({ where: { id } });
  }

  async getUpdate(id: string) {
    const record = await this.publisherRepository.findOne({ where: { id } });
    if (!record) {
      throw new HttpException('Publisher not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  async update(id: string, updatePublisherDto: UpdatePublisherDto) {
    const publisherRecord = await this.publisherRepository.findOne({
      where: {
        id: id,
      },
    });
    publisherRecord.name = updatePublisherDto.name;

    return await this.publisherRepository.save(publisherRecord);
  }

  async remove(id: string) {
    return await this.publisherRepository
      .createQueryBuilder('publishers')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
  }
}
