import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          host: config.get('NODEMAILER_HOST'),
          port: parseInt(config.get('NODEMAILER_PORT')),
          secure: false,
          // auth: {
          //   user: config.get('NODEMAILER_AUTH_USER'),
          //   pass: config.get('NODEMAILER_AUTH_PASS'),
          // },
        },
        defaults: {
          from: `"No Reply" <${config.get('NODEMAILER_FROM_ADDRESS')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}

// Export the MailService to provide it via Dependency Injection (DI) for your controllers, resolvers and services.
