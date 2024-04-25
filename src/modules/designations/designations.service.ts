import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Designation } from 'src/db/entities/designation.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private designationRepository: Repository<Designation>,
  ) {}

  lookup() {
    return this.designationRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async create(createDesignationDto: CreateDesignationDto) {
    try {
      const savingRecord = await this.designationRepository.save(
        createDesignationDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const departmentRecord = await this.designationRepository.findOne({
          where: { name: createDesignationDto.name },
          withDeleted: true,
        });
        if (departmentRecord.archived_at) {
          return await this.designationRepository.update(
            { id: departmentRecord.id },
            { name: createDesignationDto.name, archived_at: null },
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
  ): Promise<PageDto<Designation>> {
    const queryBuilder =
      this.designationRepository.createQueryBuilder('designation');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('designation.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('designation.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('designation.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['designation.id', 'designation.name']); // added selection

    // queryBuilder.where('designation.name LIKE :keyword', {
    //   keyword: `%${pageOptionsDto.search}%`,
    // });
    if (pageOptionsDto.search) {
      queryBuilder.where('designation.name LIKE :name', {
        name: `%${pageOptionsDto.search}%`,
      });
    }
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Designation>(entities, pageMetaDto);
  }

  async findAll() {
    return await this.designationRepository.find();
  }

  async findOne(id: string): Promise<Designation | null> {
    const record = await this.designationRepository.findOneBy({ id });
    if (record) {
      return record;
    } else {
      return null;
    }
  }

  async getUpdate(id: string) {
    const departmentRecord = await this.designationRepository.findOne({
      where: { id },
    });
    if (!departmentRecord) {
      throw new HttpException('Designation Not Exists', HttpStatus.NOT_FOUND);
    }
    return departmentRecord;
  }

  async update(Id: string, updateDesignationDto: UpdateDesignationDto) {
    const designationRecord = await this.designationRepository.findOne({
      where: { id: Id },
    });

    if (!designationRecord) {
      throw new HttpException('Designation Not Exists', HttpStatus.NOT_FOUND);
    }

    designationRecord.name = updateDesignationDto.name;
    return this.designationRepository.save(designationRecord);
  }

  remove(Id: string) {
    return this.designationRepository
      .createQueryBuilder('designation')
      .softDelete()
      .where('id = :id', { id: Id })
      .execute();
  }
}
