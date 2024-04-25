import { Module } from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { DesignationsController } from './designations.controller';
import { Designation } from 'src/db/entities/designation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DESIGNATION_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Designation])],
  controllers: [DesignationsController],
  providers: [
    {
      provide: DESIGNATION_SERVICE,
      useClass: DesignationsService,
    },
  ],
  exports: [DESIGNATION_SERVICE],
})
export class DesignationsModule {}
