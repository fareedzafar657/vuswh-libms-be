import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Asset } from 'src/db/entities/assets.entity';
import { AssetsIssuance } from 'src/db/entities/assets_issuance.entity';
import { User } from 'src/db/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User) {
    // const url = `example.com/auth/confirm?token=${user.reset_password_code}`;
    const encodedResetToken = encodeURIComponent(user.reset_password_code);
    const url = `${process.env.BASE_URL_FE}/auth/verifyaccount?resetToken=${encodedResetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to VU Library Management System',
      template: './createUser', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        url,
      },
    });
  }

  async sendForgotPassword(user: User) {
    const encodedResetToken = encodeURIComponent(user.reset_password_code);
    const url = `${process.env.BASE_URL_FE}/auth/verifyaccount?resetToken=${encodedResetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Reset Password',
      template: './forgotpassword', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        url,
      },
    });
  }

  async AssetIssuance(
    asset: Asset,
    user: User,
    issuanceDetails: AssetsIssuance,
  ) {
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Library Asset Issuance',
      template: './issuance', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        user: user,
        asset: asset,
        issuanceDetails: issuanceDetails,
      },
    });
  }

  async AssetReIssuance(
    issuanceRecord: AssetsIssuance,
    reIssuanceDetails: AssetsIssuance,
  ) {
    await this.mailerService.sendMail({
      to: issuanceRecord.borrower.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Library Asset Re-Issuance',
      template: './reissuance', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        user: issuanceRecord.borrower,
        asset: issuanceRecord.issued_asset,
        issuanceRecord: issuanceRecord,
        reIssuanceDetails: reIssuanceDetails,
      },
    });
  }

  async AssetReturn(returnRecord: AssetsIssuance) {
    await this.mailerService.sendMail({
      to: returnRecord.borrower.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Library Asset Return',
      template: './return', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        user: returnRecord.borrower,
        asset: returnRecord.issued_asset,
        returnRecord: returnRecord,
      },
    });
  }
}
