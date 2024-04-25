import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { DesignationsModule } from '../designations/designations.module';
import { DepartmentsModule } from '../departments/departments.module';
import { RolesModule } from '../roles/roles.module';
import { USER_SERVICE } from 'src/common/constants';
import { PermissionsModule } from '../permissions/permissions.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    DesignationsModule,
    DepartmentsModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_SERVICE,
      useClass: UsersService,
    },
  ],
  exports: [USER_SERVICE],
})
export class UsersModule {}
