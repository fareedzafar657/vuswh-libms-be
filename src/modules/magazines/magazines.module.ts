import { Module } from '@nestjs/common';
import { MagazinesService } from './magazines.service';
import { MagazinesController } from './magazines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { CategoriesModule } from '../categories/categories.module';
import { PublishersModule } from '../publishers/publishers.module';
import { LanguagesModule } from '../languages/languages.module';
import { LocationsModule } from '../locations/locations.module';
import { MaterialTypeModule } from '../material_type/material_type.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    CategoriesModule,
    PublishersModule,
    LanguagesModule,
    LocationsModule,
    MaterialTypeModule,
    CurrenciesModule,
    UsersModule,
  ],
  controllers: [MagazinesController],
  providers: [MagazinesService],
  exports: [MagazinesService],
})
export class MagazinesModule {}
