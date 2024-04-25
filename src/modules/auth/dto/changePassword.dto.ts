import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  new_password: string;
}
