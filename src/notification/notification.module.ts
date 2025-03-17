import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PusherService } from './pusher.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [NotificationService, PusherService],
  exports: [NotificationService],
})
export class NotificationModule {}
