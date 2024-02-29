import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/features/user/entities/user/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string, templateName: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: `"Support Team" <${process.env.MAIL_EMAIL}>`,
      subject: "Confirmer d'accés",
      template: `./${templateName}`,
      context: {
        name: user.name,
        code: token,
      },
    });
  }
}
