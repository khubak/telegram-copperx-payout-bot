# Copperx Telegram Payout Bot - TypeScript Interfaces

This document contains all the TypeScript interfaces needed for the Copperx Telegram Payout Bot implementation.

## Authentication Interfaces

```typescript
// src/modules/auth/interfaces/user.interface.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// src/modules/auth/interfaces/auth-response.interface.ts
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// src/modules/auth/interfaces/kyc-status.interface.ts
export interface KycStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'INDIVIDUAL' | 'BUSINESS';
  createdAt: string;
  updatedAt: string;
}
```

## Wallet Interfaces

```typescript
// src/modules/wallet/interfaces/wallet.interface.ts
export interface Wallet {
  id: string;
  name: string;
  address: string;
  network: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// src/modules/wallet/interfaces/balance.interface.ts
export interface Balance {
  walletId: string;
  currency: string;
  amount: string;
  network: string;
  updatedAt: string;
}

// src/modules/wallet/interfaces/deposit-address.interface.ts
export interface DepositAddress {
  walletId: string;
  address: string;
  network: string;
  currency: string;
}
```

## Transfer Interfaces

```typescript
// src/modules/transfer/interfaces/transfer.interface.ts
export interface Transfer {
  id: string;
  type: 'EMAIL' | 'WALLET' | 'BANK';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: string;
  currency: string;
  fee: string;
  recipient: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

// src/modules/transfer/interfaces/transfer-response.interface.ts
export interface TransferResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  message?: string;
}

// src/modules/transfer/interfaces/transfer-history.interface.ts
export interface TransferHistory {
  items: Transfer[];
  total: number;
  page: number;
  limit: number;
}

// src/modules/transfer/interfaces/bank-account.interface.ts
export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Notification Interfaces

```typescript
// src/modules/notification/interfaces/deposit-notification.interface.ts
export interface DepositNotification {
  id: string;
  amount: string;
  currency: string;
  network: string;
  walletId: string;
  status: 'PENDING' | 'COMPLETED';
  txHash: string;
  createdAt: string;
}

// src/modules/notification/interfaces/pusher-auth.interface.ts
export interface PusherAuth {
  auth: string;
  channel_data?: string;
  shared_secret?: string;
}
```

## Telegram Bot Interfaces

```typescript
// src/modules/telegram/interfaces/session.interface.ts
export interface Session {
  userId: number;
  chatId: number;
  state: SessionState;
  email?: string;
  otp?: string;
  token?: string;
  refreshToken?: string;
  organizationId?: string;
  data?: Record<string, any>;
}

// src/modules/telegram/interfaces/session-state.enum.ts
export enum SessionState {
  NONE = 'NONE',
  AWAITING_EMAIL = 'AWAITING_EMAIL',
  AWAITING_OTP = 'AWAITING_OTP',
  AUTHENTICATED = 'AUTHENTICATED',
  AWAITING_RECIPIENT_EMAIL = 'AWAITING_RECIPIENT_EMAIL',
  AWAITING_AMOUNT = 'AWAITING_AMOUNT',
  AWAITING_CURRENCY = 'AWAITING_CURRENCY',
  AWAITING_MESSAGE = 'AWAITING_MESSAGE',
  AWAITING_WALLET_ADDRESS = 'AWAITING_WALLET_ADDRESS',
  AWAITING_NETWORK = 'AWAITING_NETWORK',
  AWAITING_BANK_SELECTION = 'AWAITING_BANK_SELECTION',
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
}
```

## API Response Interfaces

```typescript
// src/shared/interfaces/api-response.interface.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// src/shared/interfaces/paginated-response.interface.ts
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// src/shared/interfaces/error-response.interface.ts
export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

## Configuration Interfaces

```typescript
// src/config/interfaces/app-config.interface.ts
export interface AppConfig {
  port: number;
  copperxApi: {
    baseUrl: string;
  };
  pusher: {
    appKey: string;
    cluster: string;
  };
}

// src/config/interfaces/telegram-config.interface.ts
export interface TelegramConfig {
  token: string;
  webhook?: {
    domain: string;
    hookPath: string;
  };
}
```

## Utility Interfaces

```typescript
// src/shared/interfaces/token-payload.interface.ts
export interface TokenPayload {
  sub: string;
  email: string;
  organizationId: string;
  iat: number;
  exp: number;
}

// src/shared/interfaces/storage.interface.ts
export interface Storage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
```

These interfaces provide a comprehensive type system for the Copperx Telegram Payout Bot, ensuring type safety throughout the application. They cover all aspects of the bot's functionality, from authentication and wallet management to fund transfers and notifications.
