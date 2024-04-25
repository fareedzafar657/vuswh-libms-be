import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  permissionIds: string[];
}
