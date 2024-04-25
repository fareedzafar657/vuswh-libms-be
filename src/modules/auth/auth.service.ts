//auth.service.ts
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_SERVICE, jwtConstants, saltOrRounds } from 'src/common/constants';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly _userServices: UsersService,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private _jwtService: JwtService,
  ) {}

  async accountVerification(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this._userServices.findResetToken(resetToken);
    if (!user) {
      throw new HttpException('User Not Exists', HttpStatus.NOT_FOUND);
    }

    const currentTime = new Date();
    if (currentTime > user.reset_code_upto) {
      throw new HttpException(
        'Verification link has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the new password before storing it in the database
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    await this._userServices.accountVerification(user.email, hashedPassword);

    // Clear the reset token after the password is successfully updated
    await this._userServices.updateResetToken(user.email, null);
  }

  async signIn(email: string, password: string): Promise<any> {
    const user = await this._userServices.findOneByEmail(email);

    if (user) {
      if (!user.is_validated) {
        throw new HttpException('User is not validated.', HttpStatus.NOT_FOUND);
      }
      if (!user.is_active) {
        throw new HttpException('User is not active.', HttpStatus.NOT_FOUND);
      }

      const extractedRoles = user.roles.map((role) => {
        const data = {
          id: role.id,
          name: role.name,
        };
        return data;
      });

      const mergedPermissions = user.permissions.map((permission) => {
        const data = {
          id: permission.id,
          name: permission.name,
        };
        return data;
      });

      const matched = await bcrypt.compareSync(password, user.password);
      if (matched) {
        const userRecord = {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          roles: extractedRoles,
          permissions: mergedPermissions,
        };

        //user permissions
        // const mergedPermissions = [];
        // for (const obj of user.permissions) {
        //   mergedPermissions.push({
        //     id: obj.id,
        //     name: obj.name,
        //   });
        // }

        // user roles's permissions
        const rolePermissions = await this._userServices.userRolesPermissions(
          user.id,
        );

        //merging permissions
        for (const obj of rolePermissions) {
          mergedPermissions.push({
            id: obj.id,
            name: obj.name,
          });
        }

        const payload = { sub: user.id, user: userRecord };
        const login_token = await this._jwtService.signAsync(payload);
        const ref_token = await this._jwtService.signAsync(payload, {
          expiresIn: '8d',
          secret: jwtConstants.secret,
        });

        this._userServices.updateLoginToken(user.email, login_token);

        return {
          user: userRecord,
          access_token: login_token,
          refresh_token: ref_token,
        };
      } else {
        throw new HttpException('Incorrect Password', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException('email does not exist.', HttpStatus.NOT_FOUND);
    }
  }

  async signout(token) {
    await this._userServices.signout(token);
    return `Logged Out`;
  }

  async accountPasswordReset(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this._userServices.findResetToken(resetToken);
    if (!user) {
      throw new HttpException('User Not Exists', HttpStatus.NOT_FOUND);
    }
    if (!user.is_validated) {
      throw new HttpException('Unauthorized User', HttpStatus.FORBIDDEN);
    }
    if (!user.is_active) {
      throw new HttpException('User is deactivated by Admin', HttpStatus.GONE);
    }

    const currentTime = new Date();
    const verificationTimestamp = user.reset_code_upto;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    if (currentTime.getTime() - verificationTimestamp.getTime() > MS_PER_DAY) {
      throw new HttpException(
        'Password Reset link has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the new password before storing it in the database
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    await this._userServices.accountVerification(user.email, hashedPassword);

    // Clear the reset token after the password is successfully updated
    await this._userServices.updateResetToken(user.email, null);
  }
  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, jwtConstants.secret);
      return !!decoded;
    } catch (error) {
      console.error('Token verification failed', error);
      return false;
    }
  }
  async changePassword(changePasswordDto: ChangePasswordDto, payload: string) {
    const Id = payload;
    const user = await this._userServices.findOneById(Id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matched = await bcrypt.compareSync(
      changePasswordDto.old_password,
      user.password,
    );
    if (matched) {
      const hashedPassword = await bcrypt.hash(
        changePasswordDto.new_password,
        saltOrRounds,
      );
      user.password = hashedPassword;
      await this._userRepository.save(user);
      return 'Password Changed Successfully';
    } else {
      throw new HttpException('Incorrect Old Password', HttpStatus.NOT_FOUND);
    }
  }
}
