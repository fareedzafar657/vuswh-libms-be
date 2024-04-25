import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLanguageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  name: string;
}
