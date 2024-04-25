import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReturnAssetDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  remarks_on_return_condition: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fine_amount: number;
}
