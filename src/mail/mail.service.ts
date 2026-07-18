import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { passwordResetTemplate } from './templates/passwordReset';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: `"MyApp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
  }

  public async sendVerificationLinkEmail(token: string, email: string) {
    const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}&email=${email}`;

    await this.sendEmail(
      email,
      'Verify Your Email',
      verifyEmailTemplate(verifyUrl),
    );
  }

  public async sendOtpEmail(otp: string, email: string) {
    await this.sendEmail(email, 'Password Reset', passwordResetTemplate(otp));
  }
}
