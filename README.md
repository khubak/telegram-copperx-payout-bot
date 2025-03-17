# Copperx Telegram Payout Bot

A Telegram bot that integrates with Copperx Payout's API, allowing users to manage their USDC transactions directly through Telegram.

## Features

- **Authentication**: Login with Copperx credentials using email OTP
- **Wallet Management**: View balances and deposit addresses
- **Fund Transfers**: Send funds to email addresses or external wallets
- **Transaction History**: View recent transactions
- **Profile Management**: Check account and KYC status
- **Real-time Notifications**: Receive deposit notifications

## Prerequisites

- Node.js (v18+)
- Yarn package manager
- Telegram Bot Token (from BotFather)
- Copperx API credentials

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/telegram-copperx-payout-bot.git
cd telegram-copperx-payout-bot
```

2. Install dependencies:

```bash
yarn install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your credentials:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WEBHOOK_DOMAIN=your_webhook_domain
COPPERX_API_URL=https://income-api.copperx.io/api
PUSHER_APP_KEY=e089376087cac1a62785
PUSHER_APP_CLUSTER=ap1
```

## Development

Run the bot in development mode:

```bash
yarn start:dev
```

## Production Deployment

1. Build the application:

```bash
yarn build
```

2. Start the production server:

```bash
yarn start:prod
```

## Bot Commands

- `/start` - Introduction and authentication
- `/login` - Login with Copperx credentials
- `/balance` - Check wallet balances
- `/deposit` - Get deposit address
- `/send` - Send funds (with subcommands for email/wallet)
- `/withdraw` - Withdraw to bank account
- `/history` - View transaction history
- `/profile` - View account profile
- `/help` - Display help information

## Architecture

The bot is built with NestJS and follows a modular architecture:

- **Auth Module**: Handles authentication and user profile
- **Wallet Module**: Manages wallet operations
- **Transfer Module**: Handles fund transfers
- **Notification Module**: Manages real-time notifications
- **Telegram Module**: Handles bot commands and user interactions

## API Documentation

The API documentation is available at `/api` when the server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For any questions regarding this bot, please contact the Copperx team on Telegram: [Copperx Community](https://t.me/copperxcommunity/2991).
