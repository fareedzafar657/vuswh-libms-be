import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
export class UpdateUserPermissionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  permissionIds: string[];
}
