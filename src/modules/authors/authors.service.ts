import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from 'src/db/entities/author.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}
  async create(createAuthorDto: CreateAuthorDto) {
    try {
      const authorRecord = await this.authorRepository.save(createAuthorDto);
      return authorRecord;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  lookup() {
    return this.authorRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return `This action updates a #${id} author`;
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
