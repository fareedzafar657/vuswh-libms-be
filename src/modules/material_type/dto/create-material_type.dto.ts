import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMaterialTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
