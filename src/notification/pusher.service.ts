import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher-js';
import { ApiService } from '../shared/http/api.service';
import { PusherAuth } from './interfaces/pusher-auth.interface';
import { DepositNotification } from './interfaces/deposit-notification.interface';

@Injectable()
export class PusherService implements OnModuleInit {
  private pusher: Pusher;

  constructor(
    private readonly configService: ConfigService,
    private readonly apiService: ApiService,
  ) {}

  onModuleInit() {
    this.pusher = new Pusher(this.configService.get<string>('pusher.appKey'), {
      cluster: this.configService.get<string>('pusher.cluster'),
      authEndpoint: `${this.configService.get<string>('copperxApi.baseUrl')}/notifications/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      },
    });
  }

  private getToken(): string {
    // This will be implemented later to retrieve the token from session storage
    return '';
  }

  subscribeToDeposits(
    organizationId: string,
    callback: (data: DepositNotification) => void,
  ) {
    const channel = this.pusher.subscribe(`private-org-${organizationId}`);
    channel.bind('deposit', callback);
    return channel;
  }

  unsubscribe(channelName: string) {
    this.pusher.unsubscribe(channelName);
  }
}
