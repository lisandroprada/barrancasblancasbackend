import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: to,
        from: this.configService.get<string>('MAIL_FROM'), // Use configured FROM address
        subject: subject,
        html: body, // Assuming body is HTML content
      });
      console.log(`Email sent successfully to: ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error; // Re-throw the error for upstream handling
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    console.log(`Sending SMS to: ${to}`);
    console.log(`Message: ${message}`);
    // TODO: Implement actual SMS sending logic using a third-party service (e.g., Twilio)
  }
}
