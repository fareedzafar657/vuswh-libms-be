import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePublisherDto {
  @IsNotEmpty()
  @MaxLength(25)
  @IsString()
  name: string;
}
