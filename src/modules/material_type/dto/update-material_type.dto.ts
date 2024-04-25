import { PartialType } from '@nestjs/swagger';
import { CreateMaterialTypeDto } from './create-material_type.dto';

export class UpdateMaterialTypeDto extends PartialType(CreateMaterialTypeDto) {}
