import { Module } from '@nestjs/common';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { CategoriesModule } from '../categories/categories.module';
import { LanguagesModule } from '../languages/languages.module';
import { LocationsModule } from '../locations/locations.module';
import { MaterialTypeModule } from '../material_type/material_type.module';
import { PublishersModule } from '../publishers/publishers.module';
import { UsersModule } from '../users/users.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { AuthorsModule } from '../authors/authors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    AuthorsModule,
    CategoriesModule,
    PublishersModule,
    MaterialTypeModule,
    LanguagesModule,
    LocationsModule,
    UsersModule,
    CurrenciesModule,
  ],
  controllers: [NovelsController],
  providers: [NovelsService],
})
export class NovelsModule {}
