import { Module } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { JournalsController } from './journals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { LocationsModule } from '../locations/locations.module';
import { LanguagesModule } from '../languages/languages.module';
import { CategoriesModule } from '../categories/categories.module';
import { PublishersModule } from '../publishers/publishers.module';
import { MaterialTypeModule } from '../material_type/material_type.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),

    CategoriesModule,
    PublishersModule,
    MaterialTypeModule,
    LanguagesModule,
    LocationsModule,
    CurrenciesModule,
    UsersModule,
  ],
  controllers: [JournalsController],
  providers: [JournalsService],
})
export class JournalsModule {}
