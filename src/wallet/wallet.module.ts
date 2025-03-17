import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
