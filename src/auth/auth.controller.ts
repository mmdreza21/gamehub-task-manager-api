import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🧠 Login endpoint
  @Post('login')
  @ApiOperation({ summary: 'Login user and receive JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in, returns an access token.',
    schema: {
      example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  @ApiResponse({ status: 403, description: 'Email not verified.' })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }

  // 👤 Get current user profile using JWT
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user information.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or token invalid.' })
  async getProfile(@Request() req) {
    return this.authService.validateUserById(req.user.userId);
  }
}
