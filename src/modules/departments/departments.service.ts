import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/db/entities/department.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  lookup() {
    return this.departmentRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const savingRecord = await this.departmentRepository.save(
        createDepartmentDto,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(error.sqlMessage, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Department>> {
    const queryBuilder =
      this.departmentRepository.createQueryBuilder('department');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('department.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('department.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('department.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['department.id', 'department.name']); // added selection
    queryBuilder.where('department.name LIKE :keyword', {
      keyword: `%${pageOptionsDto.search}%`,
    });

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Department>(entities, pageMetaDto);
  }

  async findOne(id: string): Promise<Department | null> {
    return await this.departmentRepository.findOne({ where: { id } });
  }

  async getUpdate(id: string) {
    const departmentRecord = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!departmentRecord) {
      throw new HttpException('Department Not Exists', HttpStatus.NOT_FOUND);
    }
    return departmentRecord;
  }

  async update(Id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const departmentRecord = await this.departmentRepository.findOne({
      where: { id: Id },
    });
    if (!departmentRecord) {
      throw new HttpException('Department Not Exists', HttpStatus.NOT_FOUND);
    }
    departmentRecord.name = updateDepartmentDto.name;
    return this.departmentRepository.save(departmentRecord);
  }

  async remove(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['staff'],
    });

    if (!department) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }

    if (department.staff.length > 0) {
      throw new HttpException(
        'Cannot delete, Department is associated with staff members',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.departmentRepository.softRemove(department);
  }
}
