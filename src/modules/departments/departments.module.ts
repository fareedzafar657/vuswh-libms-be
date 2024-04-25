import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DEPARTMENT_SERVICE } from 'src/common/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/db/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DepartmentsController],
  providers: [
    {
      provide: DEPARTMENT_SERVICE,
      useClass: DepartmentsService,
    },
  ],
  exports: [DEPARTMENT_SERVICE],
})
export class DepartmentsModule {}
