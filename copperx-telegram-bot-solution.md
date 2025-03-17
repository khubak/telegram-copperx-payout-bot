# Copperx Telegram Payout Bot - Solution Plan

## Project Overview

This document outlines the implementation plan for a Telegram bot that integrates with Copperx Payout's API, allowing users to manage their USDC transactions directly through Telegram.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Bot Framework**: Telegraf.js
- **API Integration**: Axios
- **Real-time Notifications**: Pusher
- **Authentication**: JWT
- **Deployment**: Render

## Project Structure

```
src/
├── config/                  # Configuration files
│   ├── app.config.ts        # App configuration
│   └── telegram.config.ts   # Telegram bot configuration
├── modules/
│   ├── telegram/            # Telegram bot module
│   │   ├── telegram.module.ts
│   │   ├── telegram.service.ts
│   │   └── telegram.update.ts
│   ├── auth/                # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── wallet/              # Wallet management module
│   │   ├── wallet.module.ts
│   │   ├── wallet.service.ts
│   │   └── dto/
│   ├── transfer/            # Fund transfer module
│   │   ├── transfer.module.ts
│   │   ├── transfer.service.ts
│   │   └── dto/
│   └── notification/        # Notification module
│       ├── notification.module.ts
│       ├── notification.service.ts
│       └── pusher.service.ts
├── shared/                  # Shared utilities
│   ├── http/                # HTTP client
│   ├── interfaces/          # Shared interfaces
│   ├── guards/              # Authentication guards
│   └── decorators/          # Custom decorators
├── app.module.ts            # Main application module
└── main.ts                  # Application entry point
```

## Implementation Plan

### 1. Project Setup

1. Initialize NestJS project with required dependencies:

   ```bash
   yarn add @nestjs/config telegraf nestjs-telegraf axios pusher-js class-validator class-transformer
   yarn add -D @types/node
   ```

2. Configure environment variables:
   - TELEGRAM_BOT_TOKEN
   - COPPERX_API_URL
   - PUSHER_APP_KEY
   - PUSHER_APP_CLUSTER

### 2. Core Modules Implementation

#### Authentication Module

- Implement email OTP request and authentication
- Store and manage user sessions
- Implement session refresh mechanism
- Add KYC/KYB status checking

#### Wallet Module

- View wallet balances
- Set default wallet
- Generate deposit addresses
- View transaction history

#### Transfer Module

- Send funds to email addresses
- Send funds to external wallets
- Withdraw funds to bank accounts
- Implement batch transfers

#### Notification Module

- Integrate with Pusher for real-time notifications
- Authenticate with notification service
- Subscribe to deposit events
- Format and send notifications to users

### 3. Telegram Bot Implementation

#### Bot Commands

- `/start` - Introduction and authentication
- `/login` - Login with Copperx credentials
- `/balance` - Check wallet balances
- `/deposit` - Get deposit address
- `/send` - Send funds (with subcommands for email/wallet)
- `/withdraw` - Withdraw to bank account
- `/history` - View transaction history
- `/profile` - View account profile
- `/help` - Display help information

#### Interactive Menus

- Implement inline keyboards for option selection
- Create conversation flows for complex operations
- Add confirmation steps for transactions

### 4. Security Implementation

- Secure storage of user credentials
- Implement proper session management
- Add transaction confirmations
- Follow Telegram Bot API security best practices

### 5. Error Handling

- Implement global exception filters
- Add proper error messages for users
- Handle API rate limits
- Implement retry mechanisms

### 6. Testing

- Unit tests for services
- Integration tests for API endpoints
- End-to-end tests for bot commands

### 7. Deployment

- Configure CI/CD pipeline
- Deploy to Render
- Set up monitoring and logging

## API Integration Details

### Authentication Endpoints

- **Request OTP**: `POST /api/auth/email-otp/request`

  ```typescript
  interface OtpRequestDto {
    email: string;
  }
  ```

- **Authenticate OTP**: `POST /api/auth/email-otp/authenticate`

  ```typescript
  interface OtpAuthenticateDto {
    email: string;
    otp: string;
  }
  ```

- **Get User Profile**: `GET /api/auth/me`

### Wallet Endpoints

- **Get Wallets**: `GET /api/wallets`
- **Get Balances**: `GET /api/wallets/balances`
- **Set Default Wallet**: `PUT /api/wallets/default`
  ```typescript
  interface DefaultWalletDto {
    walletId: string;
  }
  ```

### Transfer Endpoints

- **Email Transfer**: `POST /api/transfers/send`

  ```typescript
  interface EmailTransferDto {
    amount: string;
    currency: string;
    recipient: string;
    message?: string;
  }
  ```

- **Wallet Transfer**: `POST /api/transfers/wallet-withdraw`

  ```typescript
  interface WalletTransferDto {
    amount: string;
    currency: string;
    address: string;
    network: string;
  }
  ```

- **Bank Withdrawal**: `POST /api/transfers/offramp`

  ```typescript
  interface BankWithdrawalDto {
    amount: string;
    currency: string;
    bankId: string;
  }
  ```

- **Transaction History**: `GET /api/transfers?page=1&limit=10`

### Notification Integration

- **Authentication**: `POST /api/notifications/auth`
- **Pusher Channel**: `private-org-${organizationId}`
- **Event**: `deposit`

## Implementation Timeline

1. **Week 1**: Project setup and authentication module
2. **Week 2**: Wallet and transfer modules
3. **Week 3**: Telegram bot implementation and notification module
4. **Week 4**: Testing, documentation, and deployment

## Conclusion

This implementation plan provides a comprehensive approach to building the Copperx Telegram Payout Bot using NestJS. The modular architecture ensures clean, maintainable code while the TypeScript implementation guarantees type safety throughout the codebase.

The bot will enable users to perform all required operations directly through Telegram, including authentication, wallet management, fund transfers, and receiving real-time notifications for deposits.
