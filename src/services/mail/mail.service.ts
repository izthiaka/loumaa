import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/features/user/entities/user/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string, templateName: string) {
    const url = `https://example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: `"Support Team" <${process.env.MAIL_EMAIL}>`,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: `./${templateName}`,
      context: {
        name: user.name,
        url,
      },
    });
  }
}
