import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ObjectId } from 'bson';

import { PrismaService } from '../prisma/prisma.service';
import {
  paginatePrisma,
  PaginationOptions,
  PaginationResult,
} from '../common/utils/pagination';
import { UserDTO } from './dto/user.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { ChangePasswordDTO } from './dto/change-password-dto';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/password-reset.dto';
import { randomInt, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  // -------------------- CREATE USER --------------------
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const oldUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (oldUser)
      throw new BadRequestException(
        'Another user with this email already exists!',
      );

    const hashedPassword = await this.hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    await this.sendEmailVerification(user.email);
    return user;
  }

  // -------------------- EMAIL VERIFICATION --------------------
  async sendEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified)
      throw new BadRequestException('Email already verified');

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: token, emailVerificationExpiry: expiry },
    });

    await this.mailService.sendVerificationLinkEmail(token, email);

    return { message: 'Verification link sent successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user)
      throw new BadRequestException('Invalid or expired verification link');

    if (
      user.emailVerificationExpiry &&
      user.emailVerificationExpiry < new Date()
    ) {
      throw new BadRequestException('Verification link has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified)
      throw new BadRequestException('User already verified');

    if (!user.emailOtp || !user.emailOtpExpiry)
      throw new BadRequestException('OTP not generated');

    if (user.emailOtp !== otp) throw new BadRequestException('Invalid OTP');

    if (this.isOtpExpired(user.emailOtpExpiry))
      throw new BadRequestException('OTP expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  // -------------------- PAGINATION --------------------
  async findAll(query: PaginationOptions): Promise<PaginationResult<UserDTO>> {
    return paginatePrisma(this.prisma.user, query, {});
  }

  async findOneUser(key: string, value: string | ObjectId): Promise<User> {
    return this.prisma.user.findFirst({ where: { [key]: value } });
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    req: Prisma.UserUpdateInput,
  ): Promise<User> {
    const user = await this.prisma.user.update({ data: req, where });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // -------------------- PASSWORD --------------------
  async changePassword(userId: string, dto: ChangePasswordDTO) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const isOldPassValid = await compare(dto.oldPassword, user.password);
    if (!isOldPassValid)
      throw new BadRequestException('Incorrect old password');

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');

    const otp = randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPassToken: otp, dateOfToken: expiry },
    });

    await this.mailService.sendOtpEmail(otp, user.email);

    return { message: 'Password reset OTP sent successfully' };
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const user = await this.prisma.user.findFirst({
      where: { resetPassToken: dto.otp },
    });
    if (!user) throw new BadRequestException('Invalid OTP');

    if (this.isOtpExpired(user.dateOfToken))
      throw new BadRequestException('OTP expired');

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPassToken: null,
        dateOfToken: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  // -------------------- HELPERS --------------------
  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  private isOtpExpired(expiry: Date): boolean {
    return !expiry || new Date() > expiry;
  }
}
