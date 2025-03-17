import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  EmailOtpRequestDto,
  EmailOtpAuthenticateDto,
} from './dto/email-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Request email OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Post('email-otp/request')
  async requestEmailOtp(@Body() emailOtpRequestDto: EmailOtpRequestDto) {
    return this.authService.requestEmailOtp(emailOtpRequestDto);
  }

  @ApiOperation({ summary: 'Authenticate with email OTP' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    schema: {
      properties: {
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post('email-otp/authenticate')
  async authenticateWithEmailOtp(
    @Body() emailOtpAuthenticateDto: EmailOtpAuthenticateDto,
  ) {
    return this.authService.authenticateWithEmailOtp(emailOtpAuthenticateDto);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @Post('me')
  async getProfile() {
    return this.authService.getProfile();
  }
}
