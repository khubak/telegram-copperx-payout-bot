# Telegram Bot Bounty for Copperx Payout

## Overview
Copperx is building a stablecoin bank for individuals and businesses. We're seeking a talented developer to create a Telegram bot that integrates with Copperx Payout's API. This bot will enable users to deposit, withdraw, and transfer USDC directly through Telegram without visiting our web app.

## Technical Requirements
- Built with TypeScript/Node.js and Cursor/ChatGPT/similar
- Clean, maintainable code structure
- Comprehensive Git history with meaningful commits
- Strong type safety throughout the codebase
- Proper error handling and user feedback
- Secure handling of user credentials and sensitive information
- Thorough documentation and setup instructions

## API Documentation
The complete API documentation is available at: [Copperx API Docs](https://income-api.copperx.io/api/doc)

For any questions, feel free to ping us at [Copperx Community](https://t.me/copperxcommunity/2991)

## Core Features & API Integration

### Authentication & Account Management
**Features:**
- User login/authentication with Copperx credentials
- View account profile and status
- Check KYC/KYB approval status

**API Endpoints:**
- Auth API: `/api/auth/email-otp/request`, `/api/auth/email-otp/authenticate`
- User profile: `/api/auth/me`
- KYC status: `/api/kycs`

**Implementation Notes:**
- Redirect users to the platform if not approved for KYC/KYB
- Store session tokens securely
- Implement session refresh mechanism or session expiry handling
- Auth APIs have rate limits

### Wallet Management
**Features:**
- View all wallet balances across networks
- Set default wallet for transactions
- Allow users to deposit funds
- View transaction history

**API Endpoints:**
- Get wallets: `/api/wallets`
- Get balances: `/api/wallets/balances`
- Set default wallet: `/api/wallets/default`
- Transaction history: `/api/transfers`

### Fund Transfers
**Features:**
- Send funds to email addresses
- Send funds to external wallet addresses
- Withdraw funds to bank accounts
- View last 10 transactions

**API Endpoints:**
- Email transfer: `/api/transfers/send`
- Wallet transfer: `/api/transfers/wallet-withdraw`
- Bank withdrawal: `/api/transfers/offramp`
- Bulk transfers: `/api/transfers/send-batch`
- Transfer listing: `/api/transfers?page=1&limit=10`

**Implementation Notes:**
- Implement proper validation for recipient information
- Display fee calculations before confirming transactions
- Include confirmation steps for security
- If unable to withdraw to a bank due to the minimum amount, it's acceptable

### Deposit Notifications
**Features:**
- Receive deposit notifications
- Uses Pusher for real-time notifications ([Pusher Docs](https://pusher.com/docs/channels/using_channels/private-channels/))

**API Endpoints:**
- Authentication: `/api/notifications/auth` (POST)
- Pusher channels: `private-org-${organizationId}`
- Pusher Key: `e089376087cac1a62785`
- Pusher Cluster: `ap1`

**Implementation Notes:**
- Authenticate with the notification service using organization ID and token
- Implement a Pusher client to subscribe to appropriate channels
- Listen for event `deposit`
- Format Telegram messages with relevant transaction details

### Bot Interaction Design
- Implement intuitive command structure (`/balance`, `/send`, `/withdraw`, etc.)
- Create interactive menus for complex operations
- Develop inline keyboards for option selection
- Include help commands and clear instructions
- Support natural language queries where possible
- Add link to Copperx support: [Copperx Community](https://t.me/copperxcommunity/2183)

### Security Considerations
- Implement proper authentication flow
- Never store plaintext passwords
- Use secure session management
- Provide options for additional security (transaction confirmations)
- Follow Telegram Bot API best practices for security

## Deliverables
- Complete GitHub repository for the Telegram bot
- Deploy the bot for testing (e.g., [Render](https://render.com/) for free hosting)
- Comprehensive documentation:
  - Setup instructions
  - API integration details
  - Command reference
  - Troubleshooting guide
- Showcase your bot on X and be proud ❤️ (optional)

For questions regarding this bounty, please contact our team on Telegram: [Copperx Community](https://t.me/copperxcommunity/2991).
