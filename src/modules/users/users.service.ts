//users.service
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import {
  DEPARTMENT_SERVICE,
  DESIGNATION_SERVICE,
  PERMISSION_SERVICE,
  ROLE_SERVICE,
  saltOrRounds,
} from 'src/common/constants';
import { RolesService } from '../roles/roles.service';
import { DepartmentsService } from '../departments/departments.service';
import { DesignationsService } from '../designations/designations.service';
import * as bcrypt from 'bcrypt';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PermissionsService } from '../permissions/permissions.service';
import { UpdateUserPermissionsDto } from './dto/UpdateUserPermissions.Dto';
import { Request } from 'express';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  findOneBy(userId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(ROLE_SERVICE) private readonly _rolesService: RolesService,
    @Inject(DEPARTMENT_SERVICE)
    private readonly _departmentsService: DepartmentsService,
    @Inject(DESIGNATION_SERVICE)
    private readonly _designationsService: DesignationsService,
    @Inject(PERMISSION_SERVICE)
    private readonly _permissionService: PermissionsService,
    @Inject(MailService)
    private mailService: MailService,
  ) {}
  async create(createUserDto: CreateUserDto, payload) {
    const archivedUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: createUserDto.email })
      .andWhere('user.archived_at IS NOT NULL')
      .withDeleted()
      .getOne();

    if (archivedUser) {
      throw new HttpException(
        'User with same email already exists but is disabled.',
        HttpStatus.NOT_FOUND,
      );
    }

    const departmentRecord = await this._departmentsService.findOne(
      createUserDto.departmentId,
    );
    const designationRecord = await this._designationsService.findOne(
      createUserDto.designationId,
    );
    const roleRecords = await this._rolesService.getRolesByIds(
      createUserDto.roleIds,
    );

    if (!departmentRecord) {
      throw new HttpException(
        'Given Department Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!designationRecord) {
      throw new HttpException(
        'Given Designation Not Exists',
        HttpStatus.NOT_FOUND,
      );
    }

    if (createUserDto.roleIds.length !== roleRecords.length) {
      throw new HttpException('Given Role Not Exists', HttpStatus.NOT_FOUND);
    }
    if (!createUserDto.email.endsWith('@vu.edu.pk')) {
      throw new HttpException(
        'Email domain must be @vu.edu.pk',
        HttpStatus.NOT_FOUND,
      );
    }
    const userName = createUserDto.email.split('@')[0];

    let reset_password_code = bcrypt.genSaltSync(saltOrRounds);
    reset_password_code = reset_password_code.replace(/[\/$]/g, '-');

    const todayDate = new Date();
    todayDate.setHours(todayDate.getHours() + 24);

    const record = this.userRepository.create({
      email: createUserDto.email,
      username: userName,
      name: createUserDto.name,
      employee_id: createUserDto.employee_id,
      phone: createUserDto.phone,
      tel_ext: createUserDto.tel_ext,
      department: departmentRecord,
      designation: designationRecord,
      roles: roleRecords,
      reset_password_code: reset_password_code,
      reset_code_upto: todayDate,
      created_by: payload.user,
    });

    try {
      const savingRecord = await this.userRepository.save(record);
      if (savingRecord) {
        await this.mailService.sendUserConfirmation(savingRecord);
      }
      return savingRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          error.sqlMessage.split('for')[0],
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(error.sqlMessage, HttpStatus.NOT_FOUND);
    }
  }

  async lookup() {
    const results = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.department', 'department')
      .leftJoinAndSelect('users.designation', 'designation')
      .select([
        'users.id',
        'users.email',
        'users.username',
        'users.name',
        'users.phone',
        'users.tel_ext',
        'department.id',
        'department.name',
        'designation.id',
        'designation.name',
      ])
      .where('users.archived_at Is null')
      .orderBy('department.name', 'ASC')
      .addOrderBy('users.name', 'ASC')
      .getMany();
    return results;
  }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
    req: Request,
  ): Promise<PageDto<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.designation', 'designation');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('user.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('user.name', pageOptionsDto.order);
        break;
      case 'department':
        queryBuilder.orderBy('department.name', pageOptionsDto.order);
        break;
      case 'designation':
        queryBuilder.orderBy('designation.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('user.name', pageOptionsDto.order);
        break;
    }
    queryBuilder.select([
      'user.id',
      'user.username',
      'user.email',
      'user.name',
      'user.phone',
      'user.employee_id',
      'user.tel_ext',
      'user.is_active',
      'role.id',
      'role.name',
      'department.id',
      'department.name',
      'designation.id',
      'designation.name',
    ]); // added selection

    if (req.query.search) {
      queryBuilder.andWhere('user.name LIKE :name', {
        name: `%${req.query.search}%`,
      });
    }
    if (pageOptionsDto.roles) {
      queryBuilder.andWhere('role.name = :roleKeyword', {
        roleKeyword: `${pageOptionsDto.roles}`,
      });
    }
    if (pageOptionsDto.department) {
      queryBuilder.andWhere('department.name = :departmentKeyword', {
        departmentKeyword: `${pageOptionsDto.department}`,
      });
    }
    if (req.query.designation) {
      queryBuilder.andWhere('designation.name = :designationKeyword', {
        designationKeyword: `${req.query.designation}`,
      });
    }
    if (req.query.status) {
      queryBuilder.andWhere('user.is_active = :statusKeyword', {
        statusKeyword: `${req.query.status}`,
      });
    }
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<User>(entities, pageMetaDto);
  }

  async findOne(Id: string) {
    // return await this._userRepository.findOneBy({ id });
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.designation', 'designation')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.name',
        'user.phone',
        'user.employee_id',
        'user.tel_ext',
        'roles.id',
        'roles.name',
        'department.id',
        'department.name',
        'designation.id',
        'designation.name',
      ])
      .where('user.id = :id', { id: Id })
      .andWhere('user.archived_at IS NULL', { archived_at: null })
      .getOne();
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto, payload) {
    // Retrieve the existing user record from the database
    const userToUpdate = await this.userRepository.findOneBy({ id });

    if (!userToUpdate) {
      throw new HttpException(
        'UserToUpdate is not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Update the user properties with the new data from updateUserDto

    userToUpdate.name = updateUserDto.name;
    userToUpdate.phone = updateUserDto.phone;
    userToUpdate.employee_id = updateUserDto.employee_id;
    userToUpdate.tel_ext = updateUserDto.tel_ext;

    const departmentRecord = await this._departmentsService.findOne(
      updateUserDto.departmentId,
    );
    if (!departmentRecord) {
      throw new HttpException(
        'Given Department Not Exists for user to update',
        406,
      );
    }
    userToUpdate.department = departmentRecord;

    const designationRecord = await this._designationsService.findOne(
      updateUserDto.designationId,
    );
    if (!designationRecord) {
      throw new HttpException(
        'Given Designation Not Exists for user to update',
        407,
      );
    }
    userToUpdate.designation = designationRecord;

    if (updateUserDto.roleIds) {
      const roleRecords = await this._rolesService.getRolesByIds(
        updateUserDto.roleIds,
      );
      if (updateUserDto.roleIds.length !== roleRecords.length) {
        throw new HttpException(
          'Given Role(s) Not Exists for user to update',
          408,
        );
      }
      userToUpdate.roles = roleRecords;
    }

    userToUpdate.updated_by = payload.user;

    return await this.userRepository.save(userToUpdate);
  }

  async remove(id: string, payload) {
    await this.userRepository.softDelete(id);
    await this.userRepository.update(
      { id },
      { is_active: false, is_validated: false, archived_by: payload.user },
    );
    return 'User archived successfully';
  }

  async userActivate(id: string) {
    const userRecord = await this.userRepository.findOne({ where: { id } });

    if (userRecord.is_active) {
      await this.userRepository.update({ id }, { is_active: false });
    }
    if (!userRecord.is_active) {
      await this.userRepository.update({ id }, { is_active: true });
    }
  }

  async findResetToken(resetToken: string) {
    return this.userRepository.findOne({
      where: { reset_password_code: resetToken },
    });
  }

  async accountVerification(email: string, password: string) {
    const is_active = true;
    const is_validated = true;
    const record = await this.userRepository.update(
      { email },
      { is_active, is_validated, password },
    );
    if (!record) {
      throw new HttpException('User Not Exists', HttpStatus.NOT_FOUND);
    }
  }

  //nullifying reset_password_code and reset_code_upto
  async updateResetToken(email: string, reset_password_code: string) {
    const reset_code_upto = null;
    await this.userRepository.update(
      { email },
      {
        reset_password_code,
        reset_code_upto,
      },
    );
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const record = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.permissions', 'permission')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    return record;
  }

  async findOneById(id: string): Promise<User | null> {
    const record = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    return record;
  }

  async updateLoginToken(email: string, login_token: string): Promise<void> {
    await this.userRepository.update(
      { email },
      {
        login_token: login_token,
      },
    );
  }
  async signout(token: string) {
    const loggingOut = await this.userRepository.update(
      { login_token: token },
      { login_token: null },
    );
    if (!loggingOut) {
      throw new HttpException('logout faild', HttpStatus.BAD_REQUEST);
    }
  }

  // Assign Permission to user
  async getUserPermissions(Id: string) {
    const records = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .where('user.id = :userId', { userId: Id })
      .select([
        'user.id',
        'user.username',
        'user.phone',
        'user.email',
        'permissions.id',
        'permissions.name',
      ])
      .getOne();
    return records;
  }

  async updateUserPermissions(
    Id: string,
    updateUserPermissionsDto: UpdateUserPermissionsDto,
  ) {
    const record = await this.userRepository.findOne({
      where: {
        id: Id,
      },
    });

    if (!record) {
      throw new HttpException(
        'updateUserPermissions Record Not Found',
        HttpStatus.NOT_FOUND,
      );
    }

    const permissions = await this._permissionService.getPermissionByIds(
      updateUserPermissionsDto.permissionIds,
    );

    if (permissions.length !== updateUserPermissionsDto.permissionIds.length) {
      throw new HttpException(
        'One of the Given Permissions not Found',
        HttpStatus.BAD_REQUEST,
      );
    }

    record.permissions = permissions;

    const userRecord = await this.userRepository.save(record);

    return userRecord;
  }

  //used in AuthService
  async userRolesPermissions(userId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rolesPermissions =
      user.roles
        ?.flatMap((role) => role.permissions)
        ?.map(({ id, name }) => ({ id, name })) || [];
    return rolesPermissions;
  }

  async forgotPassword(email: string): Promise<any> {
    const aUser = await this.userRepository.findOneBy({ email });
    if (!aUser) {
      throw new HttpException('Email not exists', HttpStatus.NOT_FOUND);
    }
    if (!aUser.is_active) {
      throw new HttpException(
        'User is not active anymore',
        HttpStatus.UNAUTHORIZED,
      );
    }
    let reset_password_code = bcrypt.genSaltSync(saltOrRounds);
    reset_password_code = reset_password_code.replaceAll('/', '-');

    const todayDate = new Date();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    todayDate.setHours(todayDate.getHours() + MS_PER_DAY);
    aUser.reset_password_code = reset_password_code;
    aUser.reset_code_upto = todayDate;
    await this.userRepository.update(
      { email: aUser.email },
      {
        reset_password_code: aUser.reset_password_code,
        reset_code_upto: aUser.reset_code_upto,
      },
    );
    await this.mailService.sendForgotPassword(aUser);
  }

  async resendVerificationEmail(email: string) {
    const pendingUser = await this.userRepository.findOneBy({ email });

    if (!pendingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // If the user is already verified, there's no need to resend the link
    if (pendingUser.is_validated) {
      throw new HttpException(
        'User is already Verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    const verificationTimestamp = new Date();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    verificationTimestamp.setHours(
      verificationTimestamp.getHours() + MS_PER_DAY,
    );
    let reset_password_code = bcrypt.genSaltSync(saltOrRounds);
    reset_password_code = reset_password_code.replaceAll('/', '-');
    const emailAddress = pendingUser.email;

    await this.userRepository.update(
      { email: pendingUser.email },
      {
        reset_password_code: reset_password_code,
        reset_code_upto: verificationTimestamp,
      },
    );
    await this.mailService.sendForgotPassword(pendingUser);
  }

  async userCount() {
    const userCount = await this.userRepository
      .createQueryBuilder('users')
      .getCount();
    return userCount;
  }
}
