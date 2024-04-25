import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from 'src/db/entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PERMISSION_SERVICE } from 'src/common/constants';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [
    {
      provide: PERMISSION_SERVICE,
      useClass: PermissionsService,
    },
  ],
  exports: [PERMISSION_SERVICE],
})
export class PermissionsModule {}
