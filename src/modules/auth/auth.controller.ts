//auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Get,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 404,
    description: 'Email not exists',
  })
  @ApiResponse({
    status: 405,
    description: 'User is not Active',
  })
  @ApiResponse({
    status: 406,
    description: 'Password is incorrect',
  })
  @ApiResponse({
    status: 407,
    description: 'User Email is not Validated',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '342b25fe-44a0-4541-819b-12a43a7d98bd',
              format: 'string',
            },
            email: { type: 'string', example: 'bilal@vu.edu.pk' },
            username: { type: 'string', example: 'bilal' },
            phone: { type: 'string', example: '+923134613788' },
            roles: {
              type: 'string[]',
              example: '[36d0c9b6-592c-11ee-a96d-90b11c6fb389]',
            },
            mergedPermissions: {
              type: 'string[]',
              example: '[Admin, Librarian]',
            },
            access_token: {
              type: 'string',
              example: 'eyJhbGc8bFfrfdghfjhfgQSQ',
            },
          },
        },
      },
    },
  })
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiResponse({
    status: 200,
    description: 'User loged out successfully',
  })
  @ApiOperation({ summary: 'User Signout' })
  @ApiParam({ name: 'token', type: String })
  @UseGuards(AuthenticationGuard)
  @Get('logout')
  signout(@Req() request) {
    const token = request.token;
    return this.authService.signout(token);
  }

  @ApiOperation({ summary: 'User Verfify Account' })
  @Patch('verifyaccount/:id')
  async verifyAccount(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    if (resetPasswordDto.password !== resetPasswordDto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.authService.accountVerification(id, resetPasswordDto.password);
  }

  @ApiOperation({ summary: 'reseting user password' })
  @Patch('resetingpassword/:id')
  resetingAccount(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.accountPasswordReset(id, resetPasswordDto.password);
  }
  @Get('verify-token')
  async verifyToken(@Request() req): Promise<{ valid: boolean }> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return { valid: false };
    }

    const isValid = await this.authService.verifyToken(token);
    return { valid: isValid };
  }
  @UseGuards(AuthenticationGuard)
  @Patch('change-password')
  async changingPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() { payload },
  ) {
    return this.authService.changePassword(changePasswordDto, payload.sub);
  }
}
