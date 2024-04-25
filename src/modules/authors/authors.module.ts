import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from 'src/db/entities/author.entity';
import { AUTHOR_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorsController],
  providers: [
    {
      provide: AUTHOR_SERVICE,
      useClass: AuthorsService,
    },
  ],
  exports: [AUTHOR_SERVICE],
})
export class AuthorsModule {}
