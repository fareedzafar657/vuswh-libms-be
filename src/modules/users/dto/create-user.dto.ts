import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(50)
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(5)
  @IsString()
  employee_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(11)
  @MaxLength(13)
  @IsString()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(5)
  @IsString()
  tel_ext: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  designationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  roleIds: string[];
}
