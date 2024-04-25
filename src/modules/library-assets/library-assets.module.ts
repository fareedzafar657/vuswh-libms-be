import { Module } from '@nestjs/common';
import { LibraryAssetsService } from './library-assets.service';
import { LibraryAssetsController } from './library-assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/db/entities/assets.entity';
import { CategoriesModule } from '../categories/categories.module';
import { DepartmentsModule } from '../departments/departments.module';
import { LanguagesModule } from '../languages/languages.module';
import { LocationsModule } from '../locations/locations.module';
import { MaterialTypeModule } from '../material_type/material_type.module';
import { PublishersModule } from '../publishers/publishers.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    MailModule,
    DepartmentsModule,
    LocationsModule,
    LanguagesModule,
    CategoriesModule,
    PublishersModule,
    MaterialTypeModule,
    UsersModule,
  ],
  controllers: [LibraryAssetsController],
  providers: [LibraryAssetsService],
})
export class LibraryAssetsModule {}
