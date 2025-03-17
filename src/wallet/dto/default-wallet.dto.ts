import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DefaultWalletDto {
  @ApiProperty({
    description: 'ID of the wallet to set as default',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  walletId: string;
}
