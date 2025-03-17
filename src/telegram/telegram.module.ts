import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransferModule } from '../transfer/transfer.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('telegram.token'),
        launchOptions: {
          webhook:
            process.env.NODE_ENV === 'production'
              ? {
                  domain: configService.get<string>('telegram.webhookDomain'),
                  hookPath: '/webhook',
                }
              : undefined,
        },
      }),
    }),
    AuthModule,
    WalletModule,
    TransferModule,
    NotificationModule,
  ],
  providers: [TelegramUpdate, TelegramService],
})
export class TelegramModule {}
