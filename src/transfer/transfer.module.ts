import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}
