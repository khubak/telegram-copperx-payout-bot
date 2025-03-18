import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    // SharedModule,
    AuthModule,
    // WalletModule,
    // TransferModule,
    // NotificationModule,
    // TelegramModule,
  ],
})
export class AppModule {}
