import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { DesignationsModule } from './modules/designations/designations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocationsModule } from './modules/locations/locations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { MaterialTypeModule } from './modules/material_type/material_type.module';
import { PublishersModule } from './modules/publishers/publishers.module';
import { BooksModule } from './modules/books/books.module';
import { JournalsModule } from './modules/journals/journals.module';
import { MagazinesModule } from './modules/magazines/magazines.module';
import { NovelsModule } from './modules/novels/novels.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { LibraryAssetsModule } from './modules/library-assets/library-assets.module';
import { EbooksModule } from './modules/ebooks/ebooks.module';
import { dataSourceOptions } from './db/data-source';
import { MailModule } from './modules/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    PermissionsModule,
    RolesModule,
    DesignationsModule,
    DepartmentsModule,
    AuthModule,
    LocationsModule,
    CategoriesModule,
    LanguagesModule,
    MaterialTypeModule,
    PublishersModule,
    BooksModule,
    JournalsModule,
    MagazinesModule,
    NovelsModule,
    CurrenciesModule,
    AuthorsModule,
    LibraryAssetsModule,
    EbooksModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
