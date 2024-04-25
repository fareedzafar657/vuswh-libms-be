import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEbookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  call_no: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  subTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsOptional()
  subAuthor: [];

  @ApiProperty()
  @IsOptional()
  @IsString()
  edition_no: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ddc_classification_no: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  publisherId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  distributerId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  material_typeId: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value !== '' ? parseFloat(value) : null))
  publishing_year: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => (value !== '' ? new Date(value) : null))
  date_of_purchase: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value !== '' ? parseFloat(value) : null))
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  currencyId: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value !== '' ? parseFloat(value) : null))
  total_pages: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  languageId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  donated_by: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(25)
  isbn_no: string;
}
