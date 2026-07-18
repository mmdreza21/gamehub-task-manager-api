import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSignUpDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from './entities/user.entity';
import {
  PaginationOptions,
  PaginationResult,
} from '../common/utils/pagination';
import { UserDTO } from './dto/user.dto';
import { Serialize } from '../interceptors/serialize.iterceptor';
import { ChangePasswordDTO } from './dto/change-password-dto';
import { VerifyEmailOtpDTO } from './dto/email-verification.dto';
import {
  CommonSwaggerGet,
  CommonSwaggerGetNoAuth,
  CommonSwaggerPost,
} from '../common/decorators/common-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/password-reset.dto';

@ApiTags('users')
@Controller('users')
@Serialize(UserDTO)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // -------------------- CREATE USER --------------------
  @Post()
  @CommonSwaggerPost({ summary: 'Create a new user' })
  async create(@Body() createUserDto: UserSignUpDTO): Promise<UserDTO> {
    if (createUserDto.role === Role.AdminOfSite) {
      throw new ForbiddenException(
        'You cannot set the role to AdminOfSite directly!',
      );
    }
    return this.usersService.create({ ...createUserDto, role: Role.User });
  }

  @Post('send-verification-email')
  @CommonSwaggerPost({ summary: 'end-verification-email' })
  async sendVerificationEmail(@Body() body: ForgotPasswordDTO) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    return this.usersService.sendEmailVerification(body.email);
  }

  // -------------------- GET CURRENT USER PROFILE --------------------
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @CommonSwaggerGet({ summary: 'Get current user profile' })
  async getProfile(@Request() req): Promise<UserDTO> {
    return this.usersService.findOneUser('id', req.user.userId);
  }

  // -------------------- UPDATE USER --------------------
  @UseGuards(JwtAuthGuard)
  @Patch()
  @CommonSwaggerPost({ summary: 'Update current user info' })
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDTO> {
    return this.usersService.update({ id: req.user.userId }, updateUserDto);
  }

  // -------------------- GET ALL USERS WITH PAGINATION --------------------
  @Get()
  @CommonSwaggerGet({ summary: 'Get list of users with pagination' })
  async getUsers(
    @Query() query: PaginationOptions,
  ): Promise<PaginationResult<UserDTO>> {
    return this.usersService.findAll(query);
  }

  // -------------------- CHANGE PASSWORD --------------------
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @CommonSwaggerPost({ summary: 'Change user password' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDTO) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  // -------------------- EMAIL VERIFICATION --------------------
  @Post('verify-email')
  @CommonSwaggerPost({ summary: 'Verify email OTP' })
  async verifyEmail(@Body() dto: VerifyEmailOtpDTO) {
    return this.usersService.verifyEmailOtp(dto.email, dto.otp);
  }

  @Get('verify')
  @CommonSwaggerGetNoAuth({ summary: 'verify the user Email' })
  async verify(@Query('token') token: string) {
    return this.usersService.verifyEmail(token);
  }

  // -------------------- FORGOT PASSWORD --------------------
  @Post('forgot-password')
  @CommonSwaggerPost({ summary: 'Send OTP to reset password' })
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return this.usersService.forgotPassword(dto);
  }

  // -------------------- RESET PASSWORD --------------------
  @Post('reset-password')
  @CommonSwaggerPost({ summary: 'Reset password using OTP' })
  async resetPassword(@Body() dto: ResetPasswordDTO) {
    return this.usersService.resetPassword(dto);
  }
}
