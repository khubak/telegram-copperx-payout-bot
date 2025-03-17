import { Update, Ctx, Start, Command, On, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AuthService } from '../auth/auth.service';
import { WalletService } from '../wallet/wallet.service';
import { TransferService } from '../transfer/transfer.service';
import { NotificationService } from '../notification/notification.service';
import { TelegramService } from './telegram.service';
import { SessionState } from './interfaces/session-state.enum';
import { OtpRequestDto } from '../auth/dto/otp-request.dto';
import { OtpAuthenticateDto } from '../auth/dto/otp-authenticate.dto';
import { EmailTransferDto } from '../transfer/dto/email-transfer.dto';
import { WalletTransferDto } from '../transfer/dto/wallet-transfer.dto';
import { BankWithdrawalDto } from '../transfer/dto/bank-withdrawal.dto';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly walletService: WalletService,
    private readonly transferService: TransferService,
    private readonly notificationService: NotificationService,
    private readonly telegramService: TelegramService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const userId = ctx.from.id;
    this.telegramService.clearSession(userId);

    await ctx.reply(
      'Welcome to Copperx Payout Bot! 🚀\n\n' +
        'This bot allows you to manage your USDC transactions directly through Telegram.\n\n' +
        'To get started, use /login to authenticate with your Copperx account.',
    );
  }

  @Command('login')
  async login(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_EMAIL,
    });
    await ctx.reply('Please enter your email address:');
  }

  @Command('balance')
  async balance(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);

    if (session.state !== SessionState.AUTHENTICATED) {
      await ctx.reply('You need to login first. Use /login to authenticate.');
      return;
    }

    try {
      await ctx.reply('Fetching your wallet balances...');
      const balances = await this.walletService.getBalances();
      const formattedBalances = this.telegramService.formatBalance(balances);
      await ctx.reply(formattedBalances);
    } catch (error) {
      await ctx.reply(
        'Error fetching balances. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('deposit')
  async deposit(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);

    if (session.state !== SessionState.AUTHENTICATED) {
      await ctx.reply('You need to login first. Use /login to authenticate.');
      return;
    }

    try {
      await ctx.reply('Fetching your deposit addresses...');
      const wallets = await this.walletService.getWallets();

      if (!wallets || wallets.length === 0) {
        await ctx.reply(
          'No wallets found. Please create a wallet on the Copperx platform first.',
        );
        return;
      }

      const depositAddresses = wallets
        .map(
          (wallet) =>
            `Network: ${wallet.network}\nAddress: \`${wallet.address}\`${wallet.isDefault ? ' (Default)' : ''}`,
        )
        .join('\n\n');

      await ctx.reply('Your deposit addresses:\n\n' + depositAddresses, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      await ctx.reply(
        'Error fetching deposit addresses. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('send')
  async send(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);

    if (session.state !== SessionState.AUTHENTICATED) {
      await ctx.reply('You need to login first. Use /login to authenticate.');
      return;
    }

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
    const userId = ctx.from.id;
    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_RECIPIENT_EMAIL,
      data: { transferType: 'EMAIL' },
    });

    await ctx.reply('Please enter recipient email:');
  }

  @Action('send_wallet')
  async sendWallet(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_WALLET_ADDRESS,
      data: { transferType: 'WALLET' },
    });

    await ctx.reply('Please enter wallet address:');
  }

  @Command('withdraw')
  async withdraw(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);

    if (session.state !== SessionState.AUTHENTICATED) {
      await ctx.reply('You need to login first. Use /login to authenticate.');
      return;
    }

    await ctx.reply(
      'Bank withdrawal functionality is coming soon. Please use the Copperx web platform for now.',
    );
  }

  @Command('history')
  async history(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);

    if (session.state !== SessionState.AUTHENTICATED) {
      await ctx.reply('You need to login first. Use /login to authenticate.');
      return;
    }

    try {
      await ctx.reply('Fetching your transaction history...');
      const history = await this.transferService.getTransferHistory();

      if (!history.items || history.items.length === 0) {
        await ctx.reply('No transactions found.');
        return;
      }

      await ctx.reply('Your recent transactions:');

      // Send the last 5 transactions or fewer if less are available
      const transactions = history.items.slice(0, 5);
      for (const transaction of transactions) {
        const formattedTransaction =
          this.telegramService.formatTransaction(transaction);
        await ctx.reply(formattedTransaction);
      }

      if (history.items.length > 5) {
        await ctx.reply(
          `Showing 5 of ${history.items.length} transactions. Use the Copperx web platform to view all transactions.`,
        );
      }
    } catch (error) {
      await ctx.reply(
        'Error fetching transaction history. Please try again or use /login if you are not authenticated.',
      );
    }
  }

  @Command('profile')
  async profile(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);

    if (session.state !== SessionState.AUTHENTICATED) {
      await ctx.reply('You need to login first. Use /login to authenticate.');
      return;
    }

    try {
      await ctx.reply('Fetching your profile information...');
      const profile = await this.authService.getUserProfile();
      const kycStatus = await this.authService.getKycStatus();

      const formattedProfile = this.telegramService.formatProfile(
        profile,
        kycStatus,
      );
      await ctx.reply(formattedProfile);
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
    const userId = ctx.from.id;
    const session = this.telegramService.getSession(userId);
    const text = ctx.message.text;

    switch (session.state) {
      case SessionState.AWAITING_EMAIL:
        return this.handleEmailInput(ctx, userId, text);

      case SessionState.AWAITING_OTP:
        return this.handleOtpInput(ctx, userId, text);

      case SessionState.AWAITING_RECIPIENT_EMAIL:
        return this.handleRecipientEmailInput(ctx, userId, text);

      case SessionState.AWAITING_AMOUNT:
        return this.handleAmountInput(ctx, userId, text);

      case SessionState.AWAITING_CURRENCY:
        return this.handleCurrencyInput(ctx, userId, text);

      case SessionState.AWAITING_MESSAGE:
        return this.handleMessageInput(ctx, userId, text);

      case SessionState.AWAITING_WALLET_ADDRESS:
        return this.handleWalletAddressInput(ctx, userId, text);

      case SessionState.AWAITING_NETWORK:
        return this.handleNetworkInput(ctx, userId, text);

      case SessionState.AWAITING_CONFIRMATION:
        return this.handleConfirmationInput(ctx, userId, text);

      default:
        await ctx.reply(
          "I don't understand that command. Use /help to see available commands.",
        );
    }
  }

  // Helper methods for handling conversation states
  private async handleEmailInput(ctx: Context, userId: number, email: string) {
    try {
      const dto: OtpRequestDto = { email };
      await this.authService.requestOtp(dto);

      this.telegramService.setSession(userId, {
        state: SessionState.AWAITING_OTP,
        email,
      });

      await ctx.reply(`OTP sent to ${email}. Please enter the OTP code:`);
    } catch (error) {
      await ctx.reply(
        'Error sending OTP. Please check your email and try again.',
      );
    }
  }

  private async handleOtpInput(ctx: Context, userId: number, otp: string) {
    const session = this.telegramService.getSession(userId);

    try {
      const dto: OtpAuthenticateDto = {
        email: session.email,
        otp,
      };

      const authResponse = await this.authService.authenticateOtp(dto);

      this.telegramService.setSession(userId, {
        state: SessionState.AUTHENTICATED,
        token: authResponse.token,
        refreshToken: authResponse.refreshToken,
        organizationId: authResponse.user.organizationId,
      });

      // Subscribe to deposit notifications
      this.notificationService.subscribeUserToDeposits(
        userId.toString(),
        authResponse.user.organizationId,
        (data) => this.handleDepositNotification(userId, data),
      );

      await ctx.reply(
        `Authentication successful! Welcome, ${authResponse.user.firstName}.\n\nUse /help to see available commands.`,
      );
    } catch (error) {
      await ctx.reply(
        'Authentication failed. Please check your OTP and try again with /login.',
      );
      this.telegramService.setSession(userId, { state: SessionState.NONE });
    }
  }

  private async handleRecipientEmailInput(
    ctx: Context,
    userId: number,
    email: string,
  ) {
    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_AMOUNT,
      data: {
        ...this.telegramService.getSession(userId).data,
        recipient: email,
      },
    });

    await ctx.reply('Please enter the amount to send:');
  }

  private async handleAmountInput(
    ctx: Context,
    userId: number,
    amount: string,
  ) {
    // Basic validation for amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      await ctx.reply('Please enter a valid amount (greater than 0):');
      return;
    }

    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_CURRENCY,
      data: { ...this.telegramService.getSession(userId).data, amount },
    });

    await ctx.reply('Please enter the currency (e.g., USDC):');
  }

  private async handleCurrencyInput(
    ctx: Context,
    userId: number,
    currency: string,
  ) {
    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_MESSAGE,
      data: { ...this.telegramService.getSession(userId).data, currency },
    });

    await ctx.reply(
      'Please enter an optional message (or type "skip" to skip):',
    );
  }

  private async handleMessageInput(
    ctx: Context,
    userId: number,
    message: string,
  ) {
    const session = this.telegramService.getSession(userId);
    const transferData = session.data;

    if (message.toLowerCase() !== 'skip') {
      transferData.message = message;
    }

    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_CONFIRMATION,
      data: transferData,
    });

    // Show transfer summary for confirmation
    await ctx.reply(
      `Please confirm your transfer:\n\n` +
        `Type: ${transferData.transferType}\n` +
        `Recipient: ${transferData.recipient}\n` +
        `Amount: ${transferData.amount} ${transferData.currency}\n` +
        `${transferData.message ? `Message: ${transferData.message}\n` : ''}` +
        `\nType "confirm" to proceed or "cancel" to cancel:`,
    );
  }

  private async handleWalletAddressInput(
    ctx: Context,
    userId: number,
    address: string,
  ) {
    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_AMOUNT,
      data: { ...this.telegramService.getSession(userId).data, address },
    });

    await ctx.reply('Please enter the amount to send:');
  }

  private async handleNetworkInput(
    ctx: Context,
    userId: number,
    network: string,
  ) {
    const session = this.telegramService.getSession(userId);
    const transferData = session.data;

    this.telegramService.setSession(userId, {
      state: SessionState.AWAITING_CONFIRMATION,
      data: { ...transferData, network },
    });

    // Show transfer summary for confirmation
    await ctx.reply(
      `Please confirm your transfer:\n\n` +
        `Type: ${transferData.transferType}\n` +
        `Address: ${transferData.address}\n` +
        `Network: ${network}\n` +
        `Amount: ${transferData.amount} ${transferData.currency}\n` +
        `\nType "confirm" to proceed or "cancel" to cancel:`,
    );
  }

  private async handleConfirmationInput(
    ctx: Context,
    userId: number,
    confirmation: string,
  ) {
    if (confirmation.toLowerCase() !== 'confirm') {
      await ctx.reply('Transfer cancelled.');
      this.telegramService.setSession(userId, {
        state: SessionState.AUTHENTICATED,
      });
      return;
    }

    const session = this.telegramService.getSession(userId);
    const transferData = session.data;

    try {
      let result;

      if (transferData.transferType === 'EMAIL') {
        const dto: EmailTransferDto = {
          amount: transferData.amount,
          currency: transferData.currency,
          recipient: transferData.recipient,
          message: transferData.message,
        };

        result = await this.transferService.sendEmailTransfer(dto);
      } else if (transferData.transferType === 'WALLET') {
        const dto: WalletTransferDto = {
          amount: transferData.amount,
          currency: transferData.currency,
          address: transferData.address,
          network: transferData.network,
        };

        result = await this.transferService.sendWalletTransfer(dto);
      }

      await ctx.reply(
        `Transfer initiated successfully! Transaction ID: ${result.id}`,
      );
    } catch (error) {
      await ctx.reply('Error processing transfer. Please try again later.');
    }

    // Reset session state
    this.telegramService.setSession(userId, {
      state: SessionState.AUTHENTICATED,
    });
  }

  private async handleDepositNotification(userId: number, data: any) {
    const ctx = { telegram: { sendMessage: (chatId, text) => {} } } as Context;

    try {
      await ctx.telegram.sendMessage(
        userId,
        `💰 Deposit Received!\n\n` +
          `Amount: ${data.amount} ${data.currency}\n` +
          `Network: ${data.network}\n` +
          `Status: ${data.status}\n` +
          `Transaction Hash: ${data.txHash}`,
      );
    } catch (error) {
      console.error('Error sending deposit notification:', error);
    }
  }
}
