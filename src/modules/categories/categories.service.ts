import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { Category } from 'src/db/entities/category.entity';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  lookup() {
    return this.categoryRepository.find({
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    });
  }

  async getCategoriesById(id: string) {
    return await this.categoryRepository.find({
      where: {
        id: id,
      },
    });
  }

  // async create(createCategoryDto: CreateCategoryDto) {
  //   try {
  //     const savingRecord = await this.categoryRepository.save(
  //       createCategoryDto,
  //     );
  //     return savingRecord;
  //   } catch (error) {
  //     if (error.code === 'ER_DUP_ENTRY') {
  //       throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
  //     }
  //     throw error;
  //   }
  // }

  async getAllPageData(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Category>> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    switch (pageOptionsDto.orderBy) {
      case '':
        queryBuilder.orderBy('category.name', pageOptionsDto.order);
        break;
      case 'name':
        queryBuilder.orderBy('category.name', pageOptionsDto.order);
        break;
      default:
        queryBuilder.orderBy('category.name', pageOptionsDto.order);
        break;
    }

    queryBuilder.select(['category.id', 'category.name']); // added selection

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Category>(entities, pageMetaDto);
  }

  findOne(name: string) {
    return this.categoryRepository.findOne({ where: { name } });
  }

  // async update(id: string, updateCategoryDto: UpdateCategoryDto) {
  //   const categoryRecord = await this.categoryRepository.findOne({
  //     where: {
  //       id: id,
  //     },
  //   });
  //   categoryRecord.name = updateCategoryDto.name;

  //   return await this.categoryRepository.save(categoryRecord);
  // }

  // async remove(id: string) {
  //   return await this.categoryRepository
  //     .createQueryBuilder('categories')
  //     .softDelete()
  //     .where('id = :id', { id: id })
  //     .execute();
  // }
}
