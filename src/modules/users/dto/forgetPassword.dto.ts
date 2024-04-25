import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class forgetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
