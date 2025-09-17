import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { NotificationService } from './notification/notification.service';
import { Public } from './auth/public.decorator'; // Import Public decorator

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly notificationService: NotificationService, // Inject NotificationService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public() // Make this endpoint public for testing
  @Post('test-email')
  async testEmail(@Body() body: { to: string; subject: string; html: string }) {
    try {
      await this.notificationService.sendEmail(body.to, body.subject, body.html);
      return { message: 'Test email sent successfully!' };
    } catch (error) {
      return { message: 'Failed to send test email', error: error.message };
    }
  }
}
