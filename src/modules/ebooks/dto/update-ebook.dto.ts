import { PartialType } from '@nestjs/swagger';
import { CreateEbookDto } from './create-ebook.dto';

export class UpdateEbookDto extends PartialType(CreateEbookDto) {}
