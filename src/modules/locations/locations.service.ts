import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from 'src/db/entities/location.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}
  async create(createLocationDto: CreateLocationDto) {
    try {
      const savingRecord = await this.locationRepository.save(
        createLocationDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const locationRecord = await this.locationRepository.findOne({
          where: { name: createLocationDto.name },
          withDeleted: true,
        });
        if (locationRecord.archived_at) {
          return await this.locationRepository.update(
            { id: locationRecord.id },
            {
              name: createLocationDto.name,
              address: createLocationDto.address,
              archived_at: null,
            },
          );
        } else {
          throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
        }
      }
      throw error;
    }
  }
  lookup() {
    return this.locationRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }
  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Location>> {
    const queryBuilder = this.locationRepository.createQueryBuilder('location');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('location.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('location.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('location.name', pageOptionsDto.order);
        break;
    }

    if (pageOptionsDto.search) {
      queryBuilder.andWhere('location.name LIKE :location', {
        location: `%${pageOptionsDto.search}%`,
      });
    }
    queryBuilder.andWhere('location.archived_at IS NULL');

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Location>(entities, pageMetaDto);
  }

  findOne(id: string) {
    return this.locationRepository.findOne({ where: { id } });
  }

  async getUpdate(Id: string) {
    const updateRecord = await this.locationRepository.findOne({
      where: { id: Id },
    });
    if (!updateRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    return updateRecord;
  }

  async update(Id: string, updateLocationDto: UpdateLocationDto) {
    const locationRecord = await this.locationRepository.findOne({
      where: { id: Id },
    });
    if (!locationRecord) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    locationRecord.name = updateLocationDto.name;
    locationRecord.address = updateLocationDto.address;
    return this.locationRepository.save(locationRecord);
  }

  remove(Id: string) {
    return this.locationRepository
      .createQueryBuilder('locations')
      .softDelete()
      .where('id = :id', { id: Id })
      .execute();
  }
}
