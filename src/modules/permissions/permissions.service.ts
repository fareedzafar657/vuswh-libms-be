import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
// import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/db/entities/permission.entity';
import { EntityManager, In, Repository, TreeRepository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Permission)
    private readonly permissionTreeRepository: TreeRepository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const permissionRecord = new Permission();
    permissionRecord.name = createPermissionDto.name;
    permissionRecord.parent = createPermissionDto.parentId;
    try {
      const savingRecord = await this.permissionRepository.save(
        permissionRecord,
      );
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async PermissionsTreeView() {
    return await this.permissionTreeRepository.findTrees();
  }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Permission>> {
    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('permission.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('permission.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('permission.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['permission.id', 'permission.name']); // added selection
    queryBuilder
      .where('permission.name LIKE :keyword', {
        keyword: `%${pageOptionsDto.search}%`,
      })
      .andWhere('permission.archived_at IS NULL');
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Permission>(entities, pageMetaDto);
  }

  lookup() {
    return this.permissionRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getPermissionByIds(permissionIDs: string[]) {
    return await this.permissionRepository.find({
      where: {
        id: In([...permissionIDs]),
      },
    });
  }

  findOne(id: string) {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async update(Id: string, updatePermissionDto: UpdatePermissionDto) {
    const permissionRecord = await this.permissionRepository.findOne({
      where: { id: Id },
    });

    if (!permissionRecord) {
      throw new HttpException('User Not Exists', HttpStatus.NOT_FOUND);
    }

    permissionRecord.name = updatePermissionDto.name;
    permissionRecord.parent = updatePermissionDto.parentId;
    return this.permissionRepository.save(permissionRecord);
  }

  remove(Id: string) {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .softDelete()
      .where('id = :id', { id: Id })
      .execute();
  }
}
