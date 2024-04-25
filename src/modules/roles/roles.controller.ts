import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PERMISSION_SERVICE, ROLES, ROLE_SERVICE } from 'src/common/constants';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Role } from 'src/db/entities/role.entity';
import { UpdateRolePermissionsDto } from './dto/UpdateRolePermissions.Dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ROLES(['admin'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(
    @Inject(ROLE_SERVICE) private readonly rolesService: RolesService,
    @Inject(PERMISSION_SERVICE) private readonly _permissionServices,
  ) {}

  // @ApiOperation({ summary: 'Create Roles' })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Record not saved',
  // })
  // @Post('create')
  // async create(@Body() createRoleDto: CreateRoleDto) {
  //   const createdRole = await this.rolesService.create(createRoleDto);
  //   if (!createdRole) {
  //     throw new HttpException('Record not saved', HttpStatus.BAD_REQUEST);
  //   }
  //   const data = {
  //     id: createdRole.id,
  //     name: createdRole.name,
  //     status: createdRole.is_default,
  //   };
  //   return data;
  // }

  @ApiOperation({ summary: 'List Of Roles' })
  @ApiResponse({
    status: 200,
    description: 'List of Roles',
    schema: {
      type: 'object',
      properties: {
        data: {
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
              id: '013ec0e8-843e-11ee-8af5-90b11c6fb389',
              name: 'Admin',
            },
            {
              id: '013ebef2-843e-11ee-8af5-90b11c6fb389',
              name: 'Librarian',
            },
            {
              id: '013eaac2-843e-11ee-8af5-90b11c6fb389',
              name: 'User',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No Record Found',
  })
  @Get('pagedata')
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Role>> {
    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }
    return this.pageData(pageOptionsDto);
  }

  async pageData(pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.rolesService.getAllPageData(pageOptionsDto);
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No FoundRecord ', HttpStatus.NOT_FOUND);
    }
  }

  // @ApiOperation({ summary: 'getRolesPermissions byId in Roles' })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Role ID not provided',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Role not found',
  // })
  // @Get('rolespermissions/:id')
  // async getUserPermissions(@Param('id') id: string) {
  //   if (!id) {
  //     throw new HttpException('Role ID not provided', HttpStatus.NOT_FOUND);
  //   }

  //   const role = await this.rolesService.getRolesPermissions(id);
  //   if (!role) {
  //     throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
  //   }
  //   console.log(`Get rolepermissions by id in roles controller`);
  //   const permissions = await this._permissionServices.lookup();

  //   return {
  //     role: role,
  //     permissions: [...permissions],
  //   };
  // }

  // @ApiOperation({ summary: 'update Roles Permissions byId in Roles' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Permission update succussfully',
  //   schema: {
  //     // type: 'object',
  //     properties: {
  //       roles: {
  //         type: 'object',
  //         properties: {
  //           id: {
  //             type: 'string',
  //             example: '342b25fe-44a0-4541-819b-12a43a7d98bd',
  //           },

  //           roles: {
  //             type: 'object',
  //             properties: {
  //               name: {
  //                 type: 'string[]',
  //                 example: 'Librarian',
  //               },
  //             },
  //           },

  //           permissions: {
  //             type: 'object',
  //             properties: {
  //               id: {
  //                 type: 'string',
  //                 example: '342b25fe-44a0-4541-819b-12a43a7d98bd',
  //               },
  //               name: {
  //                 type: 'string',
  //                 example: 'users-edit',
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Record not saved',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'One of the Given Permissions not Found',
  // })
  // @Patch('rolespermissions/:id')
  // async setRolePermissions(
  //   @Param('id') id: string,
  //   @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  // ) {
  //   const record = await this.rolesService.updateRolePermissions(
  //     id,
  //     updateRolePermissionsDto,
  //   );
  //   console.log(`Patch userpermissions by id in users controller`);

  //   if (!record) {
  //     throw new HttpException('Record not saved', HttpStatus.NOT_FOUND);
  //   }

  //   return {
  //     id: record.id,
  //     role: record.name,
  //     permissions: record?.permissions?.map((p) => {
  //       return {
  //         id: p.id,
  //         name: p.name,
  //       };
  //     }),
  //   };
  // }

  // @ApiOperation({ summary: 'getRole byId in Roles' })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Role not found',
  // })
  // @Get('update/:id')
  // async getUpdate(@Param('id') id: string) {
  //   const roleRecord = await this.rolesService.findOne(id);
  //   if (roleRecord) {
  //     throw new HttpException('Role not found', 404);
  //   }
  //   return roleRecord;
  // }

  // @ApiOperation({ summary: 'Update Roles' })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Record not updated',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Role Not Exists',
  // })
  // @Patch('update/:id')
  // async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
  //   const updatedRole = await this.rolesService.update(id, updateRoleDto);
  //   if (updateRoleDto) {
  //     const data = {
  //       id: updatedRole.id,
  //       name: updatedRole.name,
  //       status: updatedRole.is_default,
  //     };
  //     return data;
  //   } else {
  //     throw new HttpException('Record not updated', HttpStatus.BAD_REQUEST);
  //   }
  // }

  // @ApiOperation({ summary: 'Delete Roles' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Role deleted successfully',
  // })
  // @Delete('delete/:id')
  // remove(@Param('id') id: string) {
  //   return this.rolesService.remove(id);
  // }
}
