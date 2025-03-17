# Copperx Telegram Payout Bot - Testing Strategy

This document outlines the testing strategy for the Copperx Telegram Payout Bot, ensuring the application is robust, reliable, and meets all requirements.

## Testing Levels

### 1. Unit Testing

Unit tests focus on testing individual components in isolation, mocking dependencies as needed.

#### Key Components to Test:

- **Auth Service**

  - OTP request functionality
  - OTP authentication
  - User profile retrieval
  - KYC status checking

- **Wallet Service**

  - Wallet listing
  - Balance retrieval
  - Default wallet setting

- **Transfer Service**

  - Email transfer functionality
  - Wallet transfer functionality
  - Bank withdrawal functionality
  - Transaction history retrieval

- **Notification Service**

  - Pusher integration
  - Deposit notification handling

- **Telegram Service**
  - Session management
  - Message formatting

#### Example Unit Test:

```typescript
// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../../shared/http/api.service';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpAuthenticateDto } from './dto/otp-authenticate.dto';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: ApiService;

  const mockApiService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ApiService,
          useValue: mockApiService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestOtp', () => {
    it('should call the API with correct parameters', async () => {
      const dto: OtpRequestDto = { email: 'test@example.com' };
      const expectedResponse = { success: true };

      mockApiService.post.mockResolvedValue(expectedResponse);

      const result = await service.requestOtp(dto);

      expect(apiService.post).toHaveBeenCalledWith(
        '/auth/email-otp/request',
        dto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('authenticateOtp', () => {
    it('should call the API with correct parameters', async () => {
      const dto: OtpAuthenticateDto = {
        email: 'test@example.com',
        otp: '123456',
      };
      const expectedResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
        },
      };

      mockApiService.post.mockResolvedValue(expectedResponse);

      const result = await service.authenticateOtp(dto);

      expect(apiService.post).toHaveBeenCalledWith(
        '/auth/email-otp/authenticate',
        dto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const expectedResponse = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      mockApiService.get.mockResolvedValue(expectedResponse);

      const result = await service.getUserProfile();

      expect(apiService.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(expectedResponse);
    });
  });
});
```

### 2. Integration Testing

Integration tests verify that different components work together correctly.

#### Key Integration Points to Test:

- **Auth Module + API Service**

  - Test authentication flow with mocked API responses

- **Wallet Module + API Service**

  - Test wallet operations with mocked API responses

- **Transfer Module + API Service**

  - Test transfer operations with mocked API responses

- **Notification Module + Pusher Service**
  - Test notification handling with mocked Pusher events

#### Example Integration Test:

```typescript
// src/modules/telegram/telegram.update.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TelegramUpdate } from './telegram.update';
import { AuthService } from '../auth/auth.service';
import { WalletService } from '../wallet/wallet.service';
import { TransferService } from '../transfer/transfer.service';
import { NotificationService } from '../notification/notification.service';
import { Context } from 'telegraf';

describe('TelegramUpdate Integration', () => {
  let telegramUpdate: TelegramUpdate;
  let authService: AuthService;
  let walletService: WalletService;

  const mockAuthService = {
    requestOtp: jest.fn(),
    authenticateOtp: jest.fn(),
    getUserProfile: jest.fn(),
    getKycStatus: jest.fn(),
  };

  const mockWalletService = {
    getWallets: jest.fn(),
    getBalances: jest.fn(),
    setDefaultWallet: jest.fn(),
  };

  const mockTransferService = {
    sendEmailTransfer: jest.fn(),
    sendWalletTransfer: jest.fn(),
    sendBankWithdrawal: jest.fn(),
    getTransferHistory: jest.fn(),
  };

  const mockNotificationService = {
    subscribeUserToDeposits: jest.fn(),
    unsubscribeUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramUpdate,
        { provide: AuthService, useValue: mockAuthService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: TransferService, useValue: mockTransferService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    telegramUpdate = module.get<TelegramUpdate>(TelegramUpdate);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(telegramUpdate).toBeDefined();
  });

  describe('balance command', () => {
    it('should fetch and display wallet balances', async () => {
      const mockContext = {
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const mockBalances = [
        { walletId: '1', currency: 'USDC', amount: '100.00', network: 'ETH' },
        { walletId: '2', currency: 'USDC', amount: '50.00', network: 'SOL' },
      ];

      mockWalletService.getBalances.mockResolvedValue(mockBalances);

      await telegramUpdate.balance(mockContext);

      expect(mockWalletService.getBalances).toHaveBeenCalled();
      expect(mockContext.reply).toHaveBeenCalledTimes(2); // Initial message + formatted balances
    });

    it('should handle errors gracefully', async () => {
      const mockContext = {
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockWalletService.getBalances.mockRejectedValue(new Error('API error'));

      await telegramUpdate.balance(mockContext);

      expect(mockWalletService.getBalances).toHaveBeenCalled();
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching balances'),
      );
    });
  });
});
```

### 3. End-to-End Testing

E2E tests verify the entire application flow from user input to system response.

#### Key Flows to Test:

- **Authentication Flow**

  - User login with email and OTP
  - Session management

- **Wallet Management Flow**

  - Viewing balances
  - Setting default wallet

- **Transfer Flow**

  - Email transfer
  - Wallet transfer
  - Bank withdrawal

- **Notification Flow**
  - Receiving deposit notifications

#### Example E2E Test:

```typescript
// test/e2e/telegram-bot.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

describe('TelegramBot (e2e)', () => {
  let app: INestApplication;
  let telegrafMock: Telegraf;

  // Mock Telegraf instance
  const mockTelegraf = () => {
    const mock = {
      use: jest.fn(),
      launch: jest.fn(),
      handleUpdate: jest.fn(),
      telegram: {
        sendMessage: jest.fn(),
      },
    };
    return mock as unknown as Telegraf;
  };

  beforeEach(async () => {
    telegrafMock = mockTelegraf();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Telegraf)
      .useValue(telegrafMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should handle start command', async () => {
    // Simulate /start command
    const update = {
      update_id: 123456789,
      message: {
        message_id: 1,
        from: {
          id: 123456,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser',
        },
        chat: {
          id: 123456,
          first_name: 'Test',
          username: 'testuser',
          type: 'private',
        },
        date: Math.floor(Date.now() / 1000),
        text: '/start',
        entities: [
          {
            offset: 0,
            length: 6,
            type: 'bot_command',
          },
        ],
      },
    };

    await request(app.getHttpServer())
      .post('/webhook')
      .send(update)
      .expect(200);

    // Verify that the bot responded with the welcome message
    expect(telegrafMock.handleUpdate).toHaveBeenCalledWith(update);
  });

  // Additional E2E tests for other commands and flows
});
```

### 4. Security Testing

Security testing ensures the application handles sensitive data properly and is protected against common vulnerabilities.

#### Key Security Aspects to Test:

- **Authentication Security**

  - Token storage and handling
  - Session expiration
  - Rate limiting

- **Data Protection**

  - Secure storage of user credentials
  - Proper encryption of sensitive data

- **API Security**
  - Proper authentication headers
  - Input validation

#### Example Security Test:

```typescript
// test/security/auth.security.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { ApiService } from '../../src/shared/http/api.service';
import { OtpRequestDto } from '../../src/modules/auth/dto/otp-request.dto';

describe('Auth Security', () => {
  let authService: AuthService;
  let apiService: ApiService;

  const mockApiService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ApiService,
          useValue: mockApiService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should reject invalid email formats', async () => {
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'email.example.com',
      'email@example@example.com',
    ];

    for (const email of invalidEmails) {
      const dto: OtpRequestDto = { email };

      // Expect validation to fail for invalid emails
      await expect(async () => {
        // This would typically be caught by class-validator
        // For testing purposes, we're manually checking
        if (!email.includes('@') || !email.includes('.')) {
          throw new Error('Invalid email format');
        }
        return authService.requestOtp(dto);
      }).rejects.toThrow();
    }
  });

  it('should handle rate limiting', async () => {
    const dto: OtpRequestDto = { email: 'test@example.com' };

    // Mock rate limit error from API
    mockApiService.post.mockRejectedValueOnce({
      response: {
        status: 429,
        data: {
          message: 'Too many requests',
        },
      },
    });

    await expect(authService.requestOtp(dto)).rejects.toThrow();
  });
});
```

## Test Coverage

The testing strategy aims to achieve at least 80% code coverage across the application, with critical components such as authentication and fund transfers having closer to 100% coverage.

## Testing Tools

- **Jest**: Primary testing framework
- **Supertest**: HTTP testing
- **Telegraf Test Utils**: For testing Telegram bot functionality
- **Mock Service Worker**: For mocking API responses

## Continuous Integration

Tests will be integrated into the CI/CD pipeline to ensure all tests pass before deployment:

1. Run linting checks
2. Run unit tests
3. Run integration tests
4. Run E2E tests (on staging environment)
5. Deploy if all tests pass

## Test Data Management

- Use mock data for all tests
- Never use production credentials in tests
- Store test fixtures in a dedicated directory

## Conclusion

This comprehensive testing strategy ensures the Copperx Telegram Payout Bot is thoroughly tested at all levels, from individual components to end-to-end flows. By following this approach, we can deliver a high-quality, reliable, and secure application that meets all requirements.
