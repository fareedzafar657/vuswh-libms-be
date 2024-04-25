import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from 'src/db/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ROLE_SERVICE } from 'src/common/constants';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  controllers: [RolesController],
  providers: [
    {
      provide: ROLE_SERVICE,
      useClass: RolesService,
    },
  ],
  exports: [ROLE_SERVICE],
})
export class RolesModule {}
