import { Module } from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { EbooksController } from './ebooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { DepartmentsModule } from '../departments/departments.module';
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
    LanguagesModule,
    CategoriesModule,
    PublishersModule,
    MaterialTypeModule,
    UsersModule,
    CurrenciesModule,
    AuthorsModule,
  ],
  controllers: [EbooksController],
  providers: [EbooksService],
})
export class EbooksModule {}
