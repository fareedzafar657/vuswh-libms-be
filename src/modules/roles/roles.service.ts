import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from 'src/db/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PERMISSION_SERVICE } from 'src/common/constants';
import { PermissionsService } from '../permissions/permissions.service';
import { UpdateRolePermissionsDto } from './dto/UpdateRolePermissions.Dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(PERMISSION_SERVICE)
    private readonly _permissionService: PermissionsService,
  ) {}

  lookup() {
    return this.roleRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  //used in UserService
  async getRolesByIds(roleIDs: string[]) {
    return await this.roleRepository.find({
      where: {
        id: In([...roleIDs]),
      },
    });
  }

  async create(createRoleDto: CreateRoleDto) {
    try {
      const savingRecord = await this.roleRepository.save(createRoleDto);
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async getAllPageData(pageOptionsDto: PageOptionsDto): Promise<PageDto<Role>> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // switch (pageOptionsDto.orderBy) {
    //   case '':
    //     queryBuilder.orderBy('role.name', pageOptionsDto.order);
    //     break;
    //   case 'name':
    //     queryBuilder.orderBy('role.name', pageOptionsDto.order);
    //     break;
    //   default:
    //     queryBuilder.orderBy('role.name', pageOptionsDto.order);
    //     break;
    // }

    queryBuilder.select(['role.id', 'role.name', 'role.is_default']); // added selection
    // Search filter

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Role>(entities, pageMetaDto);
  }

  // Assign Permission to user
  async getRolesPermissions(Id: string) {
    const records = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.id = :roleId', { roleId: Id })
      .select(['role.id', 'role.name', 'permissions.id', 'permissions.name'])
      .getOne();
    return records;
  }

  async updateRolePermissions(
    Id: string,
    updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    const record = await this.roleRepository.findOne({
      where: {
        id: Id,
      },
    });

    if (!record) {
      throw new HttpException('Record Not Found', HttpStatus.NOT_FOUND);
    }

    const permissions = await this._permissionService.getPermissionByIds(
      updateRolePermissionsDto.permissionIds,
    );

    if (permissions.length !== updateRolePermissionsDto.permissionIds.length) {
      throw new HttpException(
        'One of the Given Permissions not Found',
        HttpStatus.NOT_FOUND,
      );
    }

    record.permissions = permissions;

    const userRecord = await this.roleRepository.save(record);

    return userRecord;
  }

  findOne(id: string) {
    return this.roleRepository.findOne({ where: { id } });
  }

  async update(Id: string, updateRoleDto: UpdateRoleDto) {
    const roleRecord = await this.roleRepository.findOne({
      where: { id: Id },
    });

    if (!roleRecord) {
      throw new HttpException('Role Not Exists', HttpStatus.NOT_FOUND);
    }

    roleRecord.name = updateRoleDto.name;
    return this.roleRepository.save(roleRecord);
  }

  remove(Id: string) {
    return this.roleRepository
      .createQueryBuilder('role')
      .softDelete()
      .where('id = :id', { id: Id })
      .execute();
  }
}
