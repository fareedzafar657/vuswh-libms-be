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

export class CreateBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  call_no: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  author: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  subAuthor: [];

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(25)
  edition_no: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(25)
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
  @IsOptional()
  @IsString()
  @MaxLength(25)
  accompanying_material: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  material_typeId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(25)
  isbn_no: string;

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
  locationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  location_placed: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  donated_by: string;
}
