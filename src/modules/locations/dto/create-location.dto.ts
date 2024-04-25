import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(75)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  address: string;
}
