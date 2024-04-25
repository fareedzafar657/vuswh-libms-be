import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from 'src/db/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CATEGORY_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [
    {
      provide: CATEGORY_SERVICE,
      useClass: CategoriesService,
    },
  ],
  exports: [CATEGORY_SERVICE],
})
export class CategoriesModule {}
