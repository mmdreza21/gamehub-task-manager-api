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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService, UserFilters } from './users.service';
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
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
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

  // -------------------- GET ALL USERS WITH FILTERS AND PAGINATION --------------------
  @Get('all')
  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    enum: ['AdminOfSite', 'User'],
    example: 'User'
  })
  @ApiQuery({
    name: 'isEmailVerified',
    required: false,
    type: Boolean,
    example: true
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    enum: ['createdAt', 'updatedAt', 'name', 'email'],
    example: 'createdAt'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @UseGuards(JwtAuthGuard)
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isEmailVerified') isEmailVerified?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filters: UserFilters = {
      page,
      limit,
      search,
      role,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    // Convert isEmailVerified string to boolean
    if (isEmailVerified !== undefined) {
      filters.isEmailVerified = isEmailVerified === 'true';
    }

    return this.usersService.findAllWithFilters(filters);
  }

  // -------------------- GET USERS FOR SELECT/DROPDOWN --------------------
  @Get('select')
  @ApiOperation({ summary: 'Get users for select/dropdown (minimal data)' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  async getUsersForSelect(@Query('search') search?: string) {
    return this.usersService.getUsersForSelect();
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

  // -------------------- GET ALL USERS WITH PAGINATION (Legacy) --------------------
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
  @Post('send-verification-email')
  @CommonSwaggerPost({ summary: 'Send verification email' })
  async sendVerificationEmail(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    return this.usersService.sendEmailVerification(body.email);
  }

  @Post('verify-email')
  @CommonSwaggerPost({ summary: 'Verify email OTP' })
  async verifyEmail(@Body() dto: VerifyEmailOtpDTO) {
    return this.usersService.verifyEmailOtp(dto.email, dto.otp);
  }

  @Get('verify')
  @CommonSwaggerGetNoAuth({ summary: 'Verify the user email' })
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