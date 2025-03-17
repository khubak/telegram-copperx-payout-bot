import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpAuthenticateDto {
  @ApiProperty({
    description: 'Email address for authentication',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'One-time password received via email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
