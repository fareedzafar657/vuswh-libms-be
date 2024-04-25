import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Permission } from 'src/db/entities/permission.entity';
import { PERMISSION_SERVICE } from 'src/common/constants';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(
    @Inject(PERMISSION_SERVICE)
    private readonly permissionsService: PermissionsService,
  ) {}

  @ApiOperation({ summary: 'Create Permission' })
  @ApiResponse({
    status: 400,
    description: 'Permission not saved',
  })
  @Post('create')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const createdPermission = await this.permissionsService.create(
      createPermissionDto,
    );
    if (!createPermissionDto) {
      throw new HttpException('Permission not saved', HttpStatus.BAD_REQUEST);
    }
    const data = {
      id: createdPermission.id,
      name: createdPermission.name,
      parentId: createdPermission.parent,
    };
    return data;
  }

  @ApiOperation({ summary: 'Lookup Permission' })
  @Get('lookup')
  lookup() {
    return this.permissionsService.lookup();
  }

  @Get('tree')
  treeView() {
    return this.permissionsService.PermissionsTreeView();
  }

  @ApiOperation({ summary: 'getPageData Permission' })
  @ApiResponse({
    status: 404,
    description: 'No Record Found',
  })
  @Get('pagedata')
  // @UsePipes(ValidationPipe)
  async getAllPageData(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Permission>> {
    if (pageOptionsDto) {
      pageOptionsDto = { page: 1, take: 10, orderBy: '', search: '', skip: 0 };
    }
    return this.pageData(pageOptionsDto);
  }

  async pageData(pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.permissionsService.getAllPageData(
      pageOptionsDto,
    );
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('list/:id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Permission' })
  @ApiResponse({
    status: 400,
    description: 'Record not updated',
  })
  @ApiResponse({
    status: 201,
    description: 'Record updated successfully',
  })
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const updatedPermission = await this.permissionsService.update(
      id,
      updatePermissionDto,
    );
    if (!updatedPermission) {
      throw new HttpException('Record not updated', HttpStatus.BAD_REQUEST);
    }
    const data = {
      id: updatedPermission.id,
      name: updatedPermission.name,
      parentId: updatedPermission.parent,
      childrenIds: updatedPermission.children,
    };
    return data;
  }

  @Delete('delete/:id')
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id') id: string) {
    const result = await this.permissionsService.remove(id);
    if (!result) {
      throw new NotFoundException('Permission not found');
    }
    return { message: 'Permission deleted successfully' };
  }
}
