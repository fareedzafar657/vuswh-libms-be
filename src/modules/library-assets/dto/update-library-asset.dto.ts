import { PartialType } from '@nestjs/swagger';
import { CreateLibraryAssetDto } from './create-library-asset.dto';

export class UpdateLibraryAssetDto extends PartialType(CreateLibraryAssetDto) {}
