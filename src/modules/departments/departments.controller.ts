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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DEPARTMENT_SERVICE, ROLES } from 'src/common/constants';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { Department } from 'src/db/entities/department.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
@ROLES(['admin'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(
    @Inject(DEPARTMENT_SERVICE)
    private readonly departmentsService: DepartmentsService,
  ) {}

  @ApiOperation({ summary: 'Create Departments' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not saved or Duplicate Entry',
  })
  @Post('create')
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const createdDepartment = await this.departmentsService.create(
      createDepartmentDto,
    );
    if (!createdDepartment) {
      throw new HttpException('Record not saved.', HttpStatus.NOT_FOUND);
    }
    const data = {
      id: createdDepartment.id,
      name: createDepartmentDto.name,
    };
    return data;
  }

  @ApiOperation({ summary: 'pageData Departments' })
  @ApiResponse({
    status: 200,
    description: 'List of Departments',
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
              name: 'Department of Biotechnology',
            },
            {
              id: '013ebef2-843e-11ee-8af5-90b11c6fb389',
              name: 'Department of Computer Science and Information Technology',
            },
            {
              id: '013eaac2-843e-11ee-8af5-90b11c6fb389',
              name: 'Department of Economics',
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
  ): Promise<PageDto<Department>> {
    if (!pageOptionsDto.page) {
      pageOptionsDto.page = 1;
    }
    if (!pageOptionsDto.take) {
      pageOptionsDto.take = 10;
    }
    if (!pageOptionsDto.orderBy) {
      pageOptionsDto.orderBy = '';
    }
    if (!pageOptionsDto.search) {
      pageOptionsDto.search = '';
    }
    if (pageOptionsDto.page !== 1) {
      pageOptionsDto.skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    }

    return await this.pageData(pageOptionsDto);
  }

  async pageData(pageOptionsDto: PageOptionsDto) {
    const pageDto = await this.departmentsService.getAllPageData(
      pageOptionsDto,
    );
    if (pageDto) {
      return pageDto;
    } else {
      throw new HttpException('No Record Found', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Update Department' })
  @ApiResponse({
    status: 200,
    description: 'Department Record',
  })
  @Get('update/:id')
  async getUpdate(@Param('id') id: string) {
    const updatedDepartment = await this.departmentsService.getUpdate(id);
    const data = {
      id: updatedDepartment.id,
      name: updatedDepartment.name,
    };
    return data;
  }

  @ApiOperation({ summary: 'Update Department by Id ' })
  @ApiResponse({
    status: 201,
    description: 'Department updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not saved or User not exist',
  })
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const updatedDepartment = await this.departmentsService.update(
      id,
      updateDepartmentDto,
    );
    if (!updatedDepartment) {
      throw new HttpException('Record not saved.', HttpStatus.NOT_FOUND);
    }
    const data = {
      id: updatedDepartment.id,
      name: updatedDepartment.name,
    };
    return data;
  }

  @ApiOperation({ summary: 'Delete Departments' })
  @ApiResponse({
    status: 201,
    description: 'Department archived successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete, Department is associated with staff members',
  })
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
