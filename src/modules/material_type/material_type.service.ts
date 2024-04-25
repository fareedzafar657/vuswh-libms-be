import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMaterialTypeDto } from './dto/create-material_type.dto';
import { UpdateMaterialTypeDto } from './dto/update-material_type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialType } from 'src/db/entities/material_type.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Injectable()
export class MaterialTypeService {
  constructor(
    @InjectRepository(MaterialType)
    private readonly materialTypeRepository: Repository<MaterialType>,
  ) {}

  lookup() {
    return this.materialTypeRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getMaterial_TypeById(id: string) {
    return await this.materialTypeRepository.find({
      where: {
        id: id,
      },
    });
  }

  async create(createMaterialTypeDto: CreateMaterialTypeDto) {
    try {
      const savingRecord = await this.materialTypeRepository.save(
        createMaterialTypeDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const materialTypeRecord = await this.materialTypeRepository.findOne({
          where: { name: createMaterialTypeDto.name },
          withDeleted: true,
        });
        if (materialTypeRecord.archived_at) {
          return await this.materialTypeRepository.update(
            { id: materialTypeRecord.id },
            { name: createMaterialTypeDto.name, archived_at: null },
          );
        } else {
          throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
        }
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all materialType`;
  }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<MaterialType>> {
    const queryBuilder =
      this.materialTypeRepository.createQueryBuilder('material_type');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('material_type.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('material_type.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('material_type.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['material_type.id', 'material_type.name']); // added selection
    queryBuilder
      .where('material_type.name LIKE :keyword', {
        keyword: `%${pageOptionsDto.search}%`,
      })
      .andWhere('material_type.archived_at IS NULL');
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<MaterialType>(entities, pageMetaDto);
  }

  findOne(id: string) {
    return this.materialTypeRepository.findOne({ where: { id } });
  }

  async getUpdate(id: string) {
    const record = await this.materialTypeRepository.findOne({ where: { id } });
    if (!record) {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  async update(id: string, updateMaterial_TypeDto: UpdateMaterialTypeDto) {
    const material_typeRecord = await this.materialTypeRepository.findOne({
      where: {
        id: id,
      },
    });
    material_typeRecord.name = updateMaterial_TypeDto.name;

    return await this.materialTypeRepository.save(material_typeRecord);
  }

  async remove(id: string) {
    return await this.materialTypeRepository
      .createQueryBuilder('material_types')
      .softDelete()
      .where('id = :id', { id: id })
      .execute();
  }
}
