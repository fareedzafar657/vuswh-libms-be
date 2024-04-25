import { Module } from '@nestjs/common';
import { MaterialTypeService } from './material_type.service';
import { MaterialTypeController } from './material_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialType } from 'src/db/entities/material_type.entity';
import { MATERIAL_TYPE_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialType])],
  controllers: [MaterialTypeController],
  providers: [
    {
      provide: MATERIAL_TYPE_SERVICE,
      useClass: MaterialTypeService,
    },
  ],
  exports: [MATERIAL_TYPE_SERVICE],
})
export class MaterialTypeModule {}
