import { Injectable } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { DepositNotification } from './interfaces/deposit-notification.interface';

@Injectable()
export class NotificationService {
  private channels: Map<string, any> = new Map();

  constructor(private readonly pusherService: PusherService) {}

  subscribeUserToDeposits(
    userId: string,
    organizationId: string,
    callback: (data: DepositNotification) => void,
  ) {
    const channel = this.pusherService.subscribeToDeposits(
      organizationId,
      callback,
    );
    this.channels.set(userId, channel);
  }

  unsubscribeUser(userId: string) {
    const channel = this.channels.get(userId);
    if (channel) {
      this.pusherService.unsubscribe(channel.name);
      this.channels.delete(userId);
    }
  }
}
