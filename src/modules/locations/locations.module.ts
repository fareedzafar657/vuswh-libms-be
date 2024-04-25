import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from 'src/db/entities/location.entity';
import { LOCATION_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [LocationsController],
  providers: [
    {
      provide: LOCATION_SERVICE,
      useClass: LocationsService,
    },
  ],
  exports: [LOCATION_SERVICE],
})
export class LocationsModule {}
