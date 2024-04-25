import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DepartmentsService } from '../departments/departments.service';
import { DesignationsService } from '../designations/designations.service';
import { RolesService } from '../roles/roles.service';
import {
  DEPARTMENT_SERVICE,
  DESIGNATION_SERVICE,
  PERMISSION_SERVICE,
  ROLES,
  ROLE_SERVICE,
  USER_SERVICE,
} from 'src/common/constants';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PermissionsService } from '../permissions/permissions.service';
import { UpdateUserPermissionsDto } from './dto/UpdateUserPermissions.Dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { forgetPasswordDto } from './dto/forgetPassword.dto';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USER_SERVICE) private readonly usersService: UsersService,
    @Inject(DEPARTMENT_SERVICE)
    private readonly _departmentsService: DepartmentsService,
    @Inject(DESIGNATION_SERVICE)
    private readonly _designationsService: DesignationsService,
    @Inject(ROLE_SERVICE) private readonly _rolesService: RolesService,
    @Inject(PERMISSION_SERVICE)
    private readonly _permissionService: PermissionsService,
  ) {}

  @ApiOperation({ summary: 'Get departments, designations, and roles list' })
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({
    status: 200,
    description: 'List of Departments, Designations, and Roles',
    schema: {
      type: 'object',
      properties: {
        departments: {
          example: [
            {
              id: '7a7412eb-6a00-11ee-b495-b4a9fc762d8b',
              name: 'Department of Economics',
            },
          ],
        },
        designations: {
          example: [
            {
              id: '7a764d7b-6a00-11ee-b495-b4a9fc762d8b',
              name: 'Associate Professor',
            },
          ],
        },
        roles: {
          example: [
            {
              id: '7a68138e-6a00-11ee-b495-b4a9fc762d8b',
              name: 'admin',
            },
          ],
        },
      },
    },
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('create')
  async getCreate() {
    const departments = await this._departmentsService.lookup();
    const designations = await this._designationsService.lookup();
    const roles = await this._rolesService.lookup();
    const data = {
      departments,
      designations,
      roles,
    };
    return data;
  }

  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not saved',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto, @Req() { payload }) {
    const createdRecord = await this.usersService.create(
      createUserDto,
      payload,
    );

    if (!createdRecord) {
      throw new HttpException('Record not saved', HttpStatus.NOT_FOUND);
    }
    return 'User Created Successfully';
  }

  @ApiOperation({ summary: 'getPageData User' })
  @ApiResponse({
    status: 200,
    description: 'Users PageData',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '3e5d9a8a-ff10-4b59-a557-c343eae5ec2d',
              },
              username: { type: 'string', example: 'JohnDoe' },
              email: { type: 'string', example: 'johndoe@example.com' },
              phone: { type: 'string', example: '+923456007890' },
              name: { type: 'string', example: 'John Doe' },
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '7a68138e-6a00-11ee-b495-b4a9fc762d8b',
                    },
                    name: { type: 'string', example: 'admin' },
                  },
                },
                example: [
                  {
                    id: '7a68138e-6a00-11ee-b495-b4a9fc762d8b',
                    name: 'admin',
                  },
                ],
              },
              department: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '7a74178e-6a00-11ee-b495-b4a9fc762d8b',
                  },
                  name: { type: 'string', example: 'Department of English' },
                },
              },
              designation: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '7a764f6c-6a00-11ee-b495-b4a9fc762d8b',
                  },
                  name: { type: 'string', example: 'eLecturer' },
                },
              },
            },
          },
          example: [
            {
              id: '3e5d9a8a-ff10-4b59-a557-c343eae5ec2d',
              username: 'JohnDoe',
              email: 'johndoe@example.com',
              phone: '+923456007890',
              name: 'John Doe',
              roles: [
                {
                  id: '7a68138e-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'admin',
                },
              ],
              department: {
                id: '7a74178e-6a00-11ee-b495-b4a9fc762d8b',
                name: 'Department of English',
              },
              designation: {
                id: '7a764f6c-6a00-11ee-b495-b4a9fc762d8b',
                name: 'eLecturer',
              },
            },
            {
              id: '28e2813f-c9b2-4601-94db-25528820ba57',
              username: 'akif',
              email: 'akif@vu.edu.pk',
              phone: '+923457845123',
              name: 'akifaslam',
              roles: [],
              department: {
                id: '7a7412eb-6a00-11ee-b495-b4a9fc762d8b',
                name: 'Department of Economics',
              },
              designation: {
                id: '7a7636b5-6a00-11ee-b495-b4a9fc762d8b',
                name: 'Professor',
              },
            },
          ],
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            take: { type: 'number', example: 10 },
            itemCount: { type: 'number', example: 31 },
            pageCount: { type: 'number', example: 4 },
            hasPreviousPage: { type: 'boolean', example: false },
            hasNextPage: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No pageData Record Found',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('pagedata')
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
    @Req() req: Request,
  ) {
    const departments = await this._departmentsService.lookup();
    const designations = await this._designationsService.lookup();
    const roles = await this._rolesService.lookup();

    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (!pageOptionsDto.roles) {
      pageOptionsDto.roles = '';
    }
    if (!pageOptionsDto.department) {
      pageOptionsDto.department = '';
    }
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }

    const pagedata = await this.usersService.getAllPageData(
      pageOptionsDto,
      req,
    );
    if (!pagedata) {
      throw new HttpException('No pageData Record Found', 404);
    }
    const data = { pagedata, departments, designations, roles };
    return data;
  }

  @ApiOperation({ summary: 'Get Update User' })
  @ApiResponse({
    status: 200,
    description:
      'User Record Information with Roles, Departments, and Designations',
    schema: {
      type: 'object',
      properties: {
        userRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '00642ea1-b57f-47b7-9b4b-7f536ec73643',
            },
            username: { type: 'string', example: 'zahidali' },
            email: { type: 'string', example: 'zahidali@vu.edu.pk' },
            phone: { type: 'string', example: '+923451616700' },
            name: { type: 'string', example: 'Zahid Ali' },
            emplyeeId: { type: 'string', example: 'SD4262' },
            telExt: { type: 'string', example: '3243' },
            roles: {
              type: 'array',
              items: { type: 'object' },
              example: [
                {
                  id: '7a68138e-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'admin',
                },
                {
                  id: '7a682369-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'user',
                },
              ],
            },
            department: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '7a7412eb-6a00-11ee-b495-b4a9fc762d8b',
                },
                name: { type: 'string', example: 'Department of Economics' },
              },
            },
            designation: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '7a7636b5-6a00-11ee-b495-b4a9fc762d8b',
                },
                name: { type: 'string', example: 'Professor' },
              },
            },
          },
        },
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '7a68138e-6a00-11ee-b495-b4a9fc762d8b',
              },
              name: { type: 'string', example: 'admin' },
            },
          },
          example: [
            { id: '7a68138e-6a00-11ee-b495-b4a9fc762d8b', name: 'admin' },
            { id: '7a682369-6a00-11ee-b495-b4a9fc762d8b', name: 'user' },
            { id: '7a682459-6a00-11ee-b495-b4a9fc762d8b', name: 'librarian' },
          ],
        },
        departments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          example: [
            {
              id: '7a7412eb-6a00-11ee-b495-b4a9fc762d8b',
              name: 'Department of Economics',
            },
            {
              id: '7a7418bf-6a00-11ee-b495-b4a9fc762d8b',
              name: 'Department of Psychology',
            },
          ],
        },
        designations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          example: [
            { id: '7a7636b5-6a00-11ee-b495-b4a9fc762d8b', name: 'Professor' },
            {
              id: '7a764d7b-6a00-11ee-b495-b4a9fc762d8b',
              name: 'Associate Professor',
            },
            {
              id: '7a764ed5-6a00-11ee-b495-b4a9fc762d8b',
              name: 'Assistant Professor',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 405,
    description: 'Record not found',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('update/:id')
  async findOne(@Param('id') id: string) {
    const userRecord = await this.usersService.findOne(id);
    if (!userRecord) {
      throw new HttpException('Record not found', 405);
    }
    const roles = await this._rolesService.lookup();
    const departments = await this._departmentsService.lookup();
    const designations = await this._designationsService.lookup();

    const result = {
      userRecord,
      roles,
      departments,
      designations,
    };
    return result;
  }

  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({
    status: 200,
    description: 'User Updated Successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '00642ea1-b57f-47b7-9b4b-7f536ec73643',
            },
            email: { type: 'string', example: 'aliahmad9@vu.edu.pk' },
            username: { type: 'string', example: 'aliahmad9' },
            name: { type: 'string', example: 'Ali Ahmad' },
            phone: { type: 'string', example: '+923451616700' },
            is_active: { type: 'boolean', example: true },
            is_validated: { type: 'boolean', example: true },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '7a682369-6a00-11ee-b495-b4a9fc762d8b',
                  },
                  name: { type: 'string', example: 'user' },
                },
              },
              example: [
                { id: '7a682369-6a00-11ee-b495-b4a9fc762d8b', name: 'user' },
              ],
            },
            department: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '7a7412eb-6a00-11ee-b495-b4a9fc762d8b',
                },
                name: { type: 'string', example: 'Department of Economics' },
              },
            },
            designation: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '7a7636b5-6a00-11ee-b495-b4a9fc762d8b',
                },
                name: { type: 'string', example: 'Professor' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Given Department Not Exists for user to update',
  })
  @ApiResponse({
    status: 400,
    description: ' Given Record Not updated',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() { payload },
  ) {
    const record = await this.usersService.update(id, updateUserDto, payload);

    const departmentRecord = {
      id: record.department.id,
      name: record.department.name,
    };

    const designationRecord = {
      id: record.designation.id,
      name: record.designation.name,
    };

    const selectedRoleFields = record?.roles?.map(({ id, name }) => ({
      id,
      name,
    }));

    const updated_by = {
      id: record.updated_by.id,
      username: record.updated_by.username,
      email: record.updated_by.email,
    };

    if (record) {
      const userRecord = {
        id: record.id,
        email: record.email,
        username: record.username,
        name: record.name,
        phone: record.phone,
        telExt: record.tel_ext,
        employeeId: record.employee_id,
        is_active: record.is_active,
        is_validated: record.is_validated,
        roles: selectedRoleFields,
        department: departmentRecord,
        designation: designationRecord,
        created_by: record.created_by,
        updated_by: updated_by,
      };
      return userRecord;
    } else {
      throw new HttpException(
        'Given Record Not updated',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'getUserPermissions by Id' })
  @ApiResponse({
    status: 200,
    description: 'usersPermissions by id',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1cf4ac61-a432-499e-a4d0-9f91f59a3790',
            },
            username: { type: 'string', example: 'sajidali' },
            email: { type: 'string', example: 'sajidali@vu.edu.pk' },
            phone: { type: 'string', example: '+923451213123' },
            permissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '7a6b0d5a-6a00-11ee-b495-b4a9fc762d8b',
                  },
                  name: { type: 'string', example: 'users-manage' },
                },
              },
              example: [
                {
                  id: '7a6b0d5a-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'users-manage',
                },
                {
                  id: '7a6b24f8-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'roles-manage',
                },
                {
                  id: '7a6b260a-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'permissions-manage',
                },
              ],
            },
          },
        },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '7a6b0d5a-6a00-11ee-b495-b4a9fc762d8b',
              },
              name: { type: 'string', example: 'users-manage' },
            },
          },
          example: [
            {
              id: '7a6b0d5a-6a00-11ee-b495-b4a9fc762d8b',
              name: 'users-manage',
            },
            {
              id: '7a6b24f8-6a00-11ee-b495-b4a9fc762d8b',
              name: 'roles-manage',
            },
            {
              id: '7a6b260a-6a00-11ee-b495-b4a9fc762d8b',
              name: 'permissions-manage',
            },
            {
              id: '7a71ef82-6a00-11ee-b495-b4a9fc762d8b',
              name: 'permissions-delete',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User ID not provided',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('userpermissions/:id')
  async getUserPermissions(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('User ID not provided', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.getUserPermissions(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const permissions = await this._permissionService.lookup();

    return {
      user: user,
      permissions: [...permissions],
    };
  }

  @ApiOperation({ summary: 'updateUserPermissions' })
  @ApiResponse({
    status: 200,
    description: 'User-Permissions updated successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1cf4ac61-a432-499e-a4d0-9f91f59a3790',
            },
            username: { type: 'string', example: 'sajidali' },
            phone: { type: 'string', example: '+923451213123' },
            email: { type: 'string', example: 'sajidali@vu.edu.pk' },
            permissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '7a6f9fbf-6a00-11ee-b495-b4a9fc762d8b',
                  },
                  name: { type: 'string', example: 'roles-edit' },
                },
              },
              example: [
                {
                  id: '7a6f9fbf-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'roles-edit',
                },
                {
                  id: '7a6fa0a1-6a00-11ee-b495-b4a9fc762d8b',
                  name: 'roles-delete',
                },
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Record not saved',
  })
  @ApiResponse({
    status: 404,
    description: 'updateUserPermissions Record Not Found',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('userpermissions/:id')
  async updateUserPermissions(
    @Param('id') id: string,
    @Body() updateUserPermissionsDto: UpdateUserPermissionsDto,
  ) {
    const record = await this.usersService.updateUserPermissions(
      id,
      updateUserPermissionsDto,
    );

    if (!record) {
      throw new HttpException('Record not saved', HttpStatus.BAD_REQUEST);
    }

    return {
      id: record.id,
      username: record.username,
      phone: record.phone,
      email: record.email,
      permissions: record?.permissions?.map((p) => {
        return {
          id: p.id,
          name: p.name,
        };
      }),
    };
  }

  @ApiOperation({ summary: 'Delete User' })
  @ApiResponse({
    status: 200,
    description: 'User archived successfully',
  })
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() { payload }) {
    return this.usersService.remove(id, payload);
  }
  @ApiOperation({ summary: 'forgot-password' })
  @ApiResponse({
    status: 200,
    description:
      'Click the following link to reset your password: localhost:3000/auth/resetingpassword/$2b$10$-eKFkbYIWIPCQfuDdLsr8u',
  })
  @Post('forgot-password')
  forgetPassword(@Body() _forgetPasswordDto: forgetPasswordDto) {
    return this.usersService.forgotPassword(_forgetPasswordDto.email);
  }
  @ApiOperation({ summary: 'resend-verification-link' })
  @ApiResponse({
    status: 200,
    description:
      'Click the following link to verify your account: localhost:3000/auth/resetingpassword/$2b$10$-eKFkbYIWIPCQfuDdLsr8u',
  })
  @Post('resend-verification-link')
  async resendVerificationEmail(@Body('email') email: string) {
    return this.usersService.resendVerificationEmail(email);
  }
  @ROLES(['admin'])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('activation/:id')
  async UserActivation(@Param('id') id: string) {
    return await this.usersService.userActivate(id);
  }
}
