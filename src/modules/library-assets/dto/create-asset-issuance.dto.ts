import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateAssetIssuanceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  borrowerId: string;
}
