import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { DepartmentsModule } from '../departments/departments.module';
import { LocationsModule } from '../locations/locations.module';
import { LanguagesModule } from '../languages/languages.module';
import { CategoriesModule } from '../categories/categories.module';
import { PublishersModule } from '../publishers/publishers.module';
import { MaterialTypeModule } from '../material_type/material_type.module';
import { UsersModule } from '../users/users.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { AuthorsModule } from '../authors/authors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    DepartmentsModule,
    LocationsModule,
    LanguagesModule,
    CategoriesModule,
    PublishersModule,
    MaterialTypeModule,
    UsersModule,
    CurrenciesModule,
    AuthorsModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
