import { Injectable } from '@nestjs/common';
import {
  EmailOtpRequestDto,
  EmailOtpAuthenticateDto,
} from './dto/email-otp.dto';
import { ApiService } from '../shared/http/api.service';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpAuthenticateDto } from './dto/otp-authenticate.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { User } from './interfaces/user.interface';
import { KycStatus } from './interfaces/kyc-status.interface';

@Injectable()
export class AuthService {
  constructor(private readonly apiService: ApiService) {}

  async requestEmailOtp(emailOtpRequestDto: EmailOtpRequestDto) {
    return this.apiService.post(
      '/api/auth/email-otp/request',
      emailOtpRequestDto,
    );
  }

  async authenticateWithEmailOtp(
    emailOtpAuthenticateDto: EmailOtpAuthenticateDto,
  ) {
    return this.apiService.post(
      '/api/auth/email-otp/authenticate',
      emailOtpAuthenticateDto,
    );
  }

  async getProfile() {
    return this.apiService.get('/api/auth/me');
  }

  async requestOtp(dto: OtpRequestDto): Promise<{ success: boolean }> {
    return this.apiService.post<{ success: boolean }>(
      '/auth/email-otp/request',
      dto,
    );
  }

  async authenticateOtp(dto: OtpAuthenticateDto): Promise<AuthResponse> {
    return this.apiService.post<AuthResponse>(
      '/auth/email-otp/authenticate',
      dto,
    );
  }

  async getUserProfile(): Promise<User> {
    return this.apiService.get<User>('/auth/me');
  }

  async getKycStatus(): Promise<KycStatus[]> {
    return this.apiService.get<KycStatus[]>('/kycs');
  }
}
