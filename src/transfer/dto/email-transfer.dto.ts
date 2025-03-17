import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailTransferDto {
  @ApiProperty({
    description: 'Amount to transfer',
    example: '100.00',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'USDC',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Recipient email address',
    example: 'recipient@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipient: string;

  @ApiPropertyOptional({
    description: 'Optional message to include with the transfer',
    example: 'Payment for services',
  })
  @IsString()
  @IsOptional()
  message?: string;
}
