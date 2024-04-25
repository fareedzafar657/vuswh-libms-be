import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  name: string;
}
