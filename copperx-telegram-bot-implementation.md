# Copperx Telegram Payout Bot - Implementation Guide

## Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn package manager
- Telegram Bot Token (from BotFather)
- Copperx API credentials

### Project Initialization

1. Create a new NestJS project:

```bash
nest new telegram-copperx-payout-bot
cd telegram-copperx-payout-bot
```

2. Install required dependencies:

```bash
yarn add @nestjs/config telegraf nestjs-telegraf axios pusher-js class-validator class-transformer dotenv
yarn add -D @types/node
```

3. Create environment configuration:

```bash
# .env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
COPPERX_API_URL=https://income-api.copperx.io/api
PUSHER_APP_KEY=e089376087cac1a62785
PUSHER_APP_CLUSTER=ap1
```

## Core Implementation

### 1. Configuration Setup

Create configuration files for the application:

```typescript
// src/config/app.config.ts
export const appConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  copperxApi: {
    baseUrl: process.env.COPPERX_API_URL || 'https://income-api.copperx.io/api',
  },
  pusher: {
    appKey: process.env.PUSHER_APP_KEY || 'e089376087cac1a62785',
    cluster: process.env.PUSHER_APP_CLUSTER || 'ap1',
  },
});
```

```typescript
// src/config/telegram.config.ts
import { TelegrafModuleOptions } from 'nestjs-telegraf';

export const telegramConfig = (): TelegrafModuleOptions => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
  launchOptions: {
    webhook:
      process.env.NODE_ENV === 'production'
        ? {
            domain: process.env.WEBHOOK_DOMAIN,
            hookPath: '/webhook',
          }
        : undefined,
  },
});
```

### 2. HTTP Client Setup

Create a shared HTTP client for API requests:

```typescript
// src/shared/http/api.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class ApiService {
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('copperxApi.baseUrl'),
      timeout: 10000,
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private getToken(): string | null {
    // Implement token retrieval logic
    return null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }
}
```

### 3. Authentication Module

```typescript
// src/modules/auth/dto/otp-request.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class OtpRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

```typescript
// src/modules/auth/dto/otp-authenticate.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OtpAuthenticateDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
```

```typescript
// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { ApiService } from '../../shared/http/api.service';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpAuthenticateDto } from './dto/otp-authenticate.dto';

@Injectable()
export class AuthService {
  constructor(private readonly apiService: ApiService) {}

  async requestOtp(dto: OtpRequestDto): Promise<any> {
    return this.apiService.post('/auth/email-otp/request', dto);
  }

  async authenticateOtp(dto: OtpAuthenticateDto): Promise<any> {
    return this.apiService.post('/auth/email-otp/authenticate', dto);
  }

  async getUserProfile(): Promise<any> {
    return this.apiService.get('/auth/me');
  }

  async getKycStatus(): Promise<any> {
    return this.apiService.get('/kycs');
  }
}
```

```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiService } from '../../shared/http/api.service';

@Module({
  providers: [AuthService, ApiService],
  exports: [AuthService],
})
export class AuthModule {}
```

### 4. Wallet Module

```typescript
// src/modules/wallet/dto/default-wallet.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class DefaultWalletDto {
  @IsString()
  @IsNotEmpty()
  walletId: string;
}
```

```typescript
// src/modules/wallet/wallet.service.ts
import { Injectable } from '@nestjs/common';
import { ApiService } from '../../shared/http/api.service';
import { DefaultWalletDto } from './dto/default-wallet.dto';

@Injectable()
export class WalletService {
  constructor(private readonly apiService: ApiService) {}

  async getWallets(): Promise<any> {
    return this.apiService.get('/wallets');
  }

  async getBalances(): Promise<any> {
    return this.apiService.get('/wallets/balances');
  }

  async setDefaultWallet(dto: DefaultWalletDto): Promise<any> {
    return this.apiService.put('/wallets/default', dto);
  }
}
```

```typescript
// src/modules/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiService } from '../../shared/http/api.service';

@Module({
  providers: [WalletService, ApiService],
  exports: [WalletService],
})
export class WalletModule {}
```

### 5. Transfer Module

```typescript
// src/modules/transfer/dto/email-transfer.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailTransferDto {
  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEmail()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsOptional()
  message?: string;
}
```

```typescript
// src/modules/transfer/dto/wallet-transfer.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class WalletTransferDto {
  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  network: string;
}
```

```typescript
// src/modules/transfer/dto/bank-withdrawal.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class BankWithdrawalDto {
  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  bankId: string;
}
```

```typescript
// src/modules/transfer/transfer.service.ts
import { Injectable } from '@nestjs/common';
import { ApiService } from '../../shared/http/api.service';
import { EmailTransferDto } from './dto/email-transfer.dto';
import { WalletTransferDto } from './dto/wallet-transfer.dto';
import { BankWithdrawalDto } from './dto/bank-withdrawal.dto';

@Injectable()
export class TransferService {
  constructor(private readonly apiService: ApiService) {}

  async sendEmailTransfer(dto: EmailTransferDto): Promise<any> {
    return this.apiService.post('/transfers/send', dto);
  }

  async sendWalletTransfer(dto: WalletTransferDto): Promise<any> {
    return this.apiService.post('/transfers/wallet-withdraw', dto);
  }

  async sendBankWithdrawal(dto: BankWithdrawalDto): Promise<any> {
    return this.apiService.post('/transfers/offramp', dto);
  }

  async getTransferHistory(page = 1, limit = 10): Promise<any> {
    return this.apiService.get(`/transfers?page=${page}&limit=${limit}`);
  }
}
```

```typescript
// src/modules/transfer/transfer.module.ts
import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { ApiService } from '../../shared/http/api.service';

@Module({
  providers: [TransferService, ApiService],
  exports: [TransferService],
})
export class TransferModule {}
```

### 6. Notification Module

```typescript
// src/modules/notification/pusher.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher-js';
import { ApiService } from '../../shared/http/api.service';

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
    // Implement token retrieval logic
    return '';
  }

  subscribeToDeposits(organizationId: string, callback: (data: any) => void) {
    const channel = this.pusher.subscribe(`private-org-${organizationId}`);
    channel.bind('deposit', callback);
    return channel;
  }

  unsubscribe(channelName: string) {
    this.pusher.unsubscribe(channelName);
  }
}
```

```typescript
// src/modules/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { PusherService } from './pusher.service';

@Injectable()
export class NotificationService {
  private channels: Map<string, any> = new Map();

  constructor(private readonly pusherService: PusherService) {}

  subscribeUserToDeposits(
    userId: string,
    organizationId: string,
    callback: (data: any) => void,
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
```

```typescript
// src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PusherService } from './pusher.service';
import { ApiService } from '../../shared/http/api.service';

@Module({
  providers: [NotificationService, PusherService, ApiService],
  exports: [NotificationService],
})
export class NotificationModule {}
```

### 7. Telegram Bot Implementation

```typescript
// src/modules/telegram/telegram.update.ts
import { Update, Ctx, Start, Command, On, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AuthService } from '../auth/auth.service';
import { WalletService } from '../wallet/wallet.service';
import { TransferService } from '../transfer/transfer.service';
import { NotificationService } from '../notification/notification.service';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly walletService: WalletService,
    private readonly transferService: TransferService,
    private readonly notificationService: NotificationService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      'Welcome to Copperx Payout Bot! 🚀\n\n' +
        'This bot allows you to manage your USDC transactions directly through Telegram.\n\n' +
        'To get started, use /login to authenticate with your Copperx account.',
    );
  }

  @Command('login')
  async login(@Ctx() ctx: Context) {
    // Implement login flow
    await ctx.reply('Please enter your email address:');
    // Set conversation state to expect email
  }

  @Command('balance')
  async balance(@Ctx() ctx: Context) {
    try {
      // Check if user is authenticated
      const balances = await this.walletService.getBalances();
      // Format and display balances
      await ctx.reply('Your wallet balances:');
      // Display formatted balances
    } catch (error) {
      await ctx.reply(
        'Error fetching balances. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('deposit')
  async deposit(@Ctx() ctx: Context) {
    try {
      // Check if user is authenticated
      const wallets = await this.walletService.getWallets();
      // Display deposit addresses for different networks
      await ctx.reply('Your deposit addresses:');
      // Display formatted addresses
    } catch (error) {
      await ctx.reply(
        'Error fetching deposit addresses. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('send')
  async send(@Ctx() ctx: Context) {
    // Display send options (email or wallet)
    await ctx.reply('Choose send method:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Send to Email', callback_data: 'send_email' }],
          [{ text: 'Send to Wallet', callback_data: 'send_wallet' }],
        ],
      },
    });
  }

  @Action('send_email')
  async sendEmail(@Ctx() ctx: Context) {
    // Start email send flow
    await ctx.reply('Please enter recipient email:');
    // Set conversation state to expect email
  }

  @Action('send_wallet')
  async sendWallet(@Ctx() ctx: Context) {
    // Start wallet send flow
    await ctx.reply('Please enter wallet address:');
    // Set conversation state to expect wallet address
  }

  @Command('withdraw')
  async withdraw(@Ctx() ctx: Context) {
    // Start bank withdrawal flow
    await ctx.reply('Please select a bank account:');
    // Display bank accounts or prompt to add one
  }

  @Command('history')
  async history(@Ctx() ctx: Context) {
    try {
      // Check if user is authenticated
      const history = await this.transferService.getTransferHistory();
      // Format and display transaction history
      await ctx.reply('Your recent transactions:');
      // Display formatted history
    } catch (error) {
      await ctx.reply(
        'Error fetching transaction history. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('profile')
  async profile(@Ctx() ctx: Context) {
    try {
      // Check if user is authenticated
      const profile = await this.authService.getUserProfile();
      const kycStatus = await this.authService.getKycStatus();
      // Format and display profile information
      await ctx.reply('Your profile:');
      // Display formatted profile
    } catch (error) {
      await ctx.reply(
        'Error fetching profile. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('help')
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      'Available commands:\n\n' +
        '/login - Login with Copperx credentials\n' +
        '/balance - Check wallet balances\n' +
        '/deposit - Get deposit address\n' +
        '/send - Send funds\n' +
        '/withdraw - Withdraw to bank account\n' +
        '/history - View transaction history\n' +
        '/profile - View account profile\n' +
        '/help - Display this help message',
    );
  }

  // Handle text messages for conversation flows
  @On('text')
  async onText(@Ctx() ctx: Context) {
    // Implement conversation state machine
    // Handle different states based on current conversation
  }
}
```

```typescript
// src/modules/telegram/telegram.service.ts
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class TelegramService {
  // Store user session data
  private sessions: Map<number, any> = new Map();

  getSession(userId: number): any {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {});
    }
    return this.sessions.get(userId);
  }

  setSession(userId: number, data: any): void {
    this.sessions.set(userId, data);
  }

  clearSession(userId: number): void {
    this.sessions.delete(userId);
  }

  // Helper methods for formatting messages
  formatBalance(balance: any): string {
    // Implement balance formatting
    return '';
  }

  formatTransaction(transaction: any): string {
    // Implement transaction formatting
    return '';
  }

  formatProfile(profile: any, kycStatus: any): string {
    // Implement profile formatting
    return '';
  }
}
```

```typescript
// src/modules/telegram/telegram.module.ts
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
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
        launchOptions: {
          webhook:
            process.env.NODE_ENV === 'production'
              ? {
                  domain: configService.get<string>('WEBHOOK_DOMAIN'),
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
```

### 8. Main Application Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from './modules/telegram/telegram.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { NotificationModule } from './modules/notification/notification.module';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TelegramModule,
    AuthModule,
    WalletModule,
    TransferModule,
    NotificationModule,
  ],
})
export class AppModule {}
```

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

## Deployment

### Render Deployment

1. Create a `render.yaml` file in the project root:

```yaml
services:
  - type: web
    name: telegram-copperx-payout-bot
    env: node
    buildCommand: yarn install && yarn build
    startCommand: yarn start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: WEBHOOK_DOMAIN
        sync: false
      - key: COPPERX_API_URL
        value: https://income-api.copperx.io/api
      - key: PUSHER_APP_KEY
        value: e089376087cac1a62785
      - key: PUSHER_APP_CLUSTER
        value: ap1
```

2. Push your code to GitHub and connect to Render for deployment.

## Testing

### Unit Tests

Create unit tests for each service:

```typescript
// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../../shared/http/api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: ApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ApiService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests for each method
});
```

## Conclusion

This implementation guide provides a detailed approach to building the Copperx Telegram Payout Bot using NestJS. The modular architecture ensures clean, maintainable code while the TypeScript implementation guarantees type safety throughout the codebase.

By following this guide, you can create a fully functional Telegram bot that integrates with Copperx Payout's API, allowing users to manage their USDC transactions directly through Telegram.
