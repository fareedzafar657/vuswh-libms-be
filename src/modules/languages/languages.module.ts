import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from 'src/db/entities/language.entity';
import { LANGUAGE_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  controllers: [LanguagesController],
  providers: [
    {
      provide: LANGUAGE_SERVICE,
      useClass: LanguagesService,
    },
  ],
  exports: [LANGUAGE_SERVICE],
})
export class LanguagesModule {}
