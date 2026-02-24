import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { QUEUES, EMAIL_JOBS } from '../../../shared/constants/queue.constants';

export interface OfflineNotificationJob {
  recipientEmail: string;
  recipientUsername: string;
  senderUsername: string;
  roomName: string;
  messageContent: string;
}

@Processor(QUEUES.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly configService: ConfigService) {}

  @Process(EMAIL_JOBS.SEND_OFFLINE_NOTIFICATION)
  async handleOfflineNotification(job: Job<OfflineNotificationJob>): Promise<void> {

    const {
        recipientEmail,
        recipientUsername,
        senderUsername,
        messageContent,
        } = job.data;
    
    this.logger.log(`📧 Sending email to ${recipientEmail}...`);

    try {
        const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('mail.host'),
        port: this.configService.get<number>('mail.port'),
        secure: false,
        auth: {
            user: this.configService.get<string>('mail.user'),
            pass: this.configService.get<string>('mail.pass'),
        },
        });

        await transporter.verify();
        this.logger.log('✅ SMTP connection verified');

        await transporter.sendMail({
        from: `"Realtime Chat" <${this.configService.get<string>('mail.user')}>`,
        to: recipientEmail,
        subject: `💬 New message from ${senderUsername}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Hey ${recipientUsername}! 👋</h2>
            <p>You have a new message from <strong>${senderUsername}</strong>:</p>
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; color: #111827;">${messageContent}</p>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
                Log in to reply to this message.
            </p>
            </div>
        `,
        });

        this.logger.log(`✅ Email sent to ${recipientEmail}`);
    } catch (error){
        this.logger.error(`❌ Failed to send email to ${recipientEmail}:`, error);
        throw error; 
    }
    
  }
}

// Local Testing/////////

// import { Processor, Process } from '@nestjs/bull';
// import type { Job } from 'bull';
// import { Logger } from '@nestjs/common';
// import { QUEUES, EMAIL_JOBS } from '../../../shared/constants/queue.constants';

// export interface OfflineNotificationJob {
//   recipientEmail: string;
//   recipientUsername: string;
//   senderUsername: string;
//   roomName: string;
//   messageContent: string;
// }

// @Processor(QUEUES.EMAIL)
// export class EmailProcessor {
//   private readonly logger = new Logger(EmailProcessor.name);

//   @Process(EMAIL_JOBS.SEND_OFFLINE_NOTIFICATION)
//   async handleOfflineNotification(job: Job<OfflineNotificationJob>): Promise<void> {
//     const { recipientEmail, recipientUsername, senderUsername, messageContent } = job.data;

//     // In production you'd use Nodemailer/Resend here
//     // For now we simulate it with a log
//     this.logger.log(
//       `📧 Sending email to ${recipientEmail} (${recipientUsername}): ` +
//       `${senderUsername} sent you a message: "${messageContent.substring(0, 50)}..."`
//     );

//     // Simulate email sending delay
//     await new Promise((resolve) => setTimeout(resolve, 100));

//     this.logger.log(`✅ Email sent to ${recipientEmail}`);
//   }
// }