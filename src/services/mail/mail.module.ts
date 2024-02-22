import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: `${process.env.MAIL_HOST}`,
        port: parseInt(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: `${process.env.MAIL_USERNAME}`,
          pass: `${process.env.MAIL_PASSWORD}`,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_EMAIL}>`,
      },
      template: {
        dir: join(__dirname, '../../views', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
