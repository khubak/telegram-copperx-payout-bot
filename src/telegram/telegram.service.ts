import { Injectable } from '@nestjs/common';
import { Session } from './interfaces/session.interface';
import { SessionState } from './interfaces/session-state.enum';
import { User } from '../auth/interfaces/user.interface';
import { KycStatus } from '../auth/interfaces/kyc-status.interface';
import { Balance } from '../wallet/interfaces/balance.interface';
import { Transfer } from '../transfer/interfaces/transfer.interface';

@Injectable()
export class TelegramService {
  // Store user session data
  private sessions: Map<number, Session> = new Map();

  getSession(userId: number): Session {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        chatId: userId,
        state: SessionState.NONE,
      });
    }
    return this.sessions.get(userId);
  }

  setSession(userId: number, data: Partial<Session>): void {
    const currentSession = this.getSession(userId);
    this.sessions.set(userId, { ...currentSession, ...data });
  }

  clearSession(userId: number): void {
    this.sessions.delete(userId);
  }

  // Helper methods for formatting messages
  formatBalance(balances: Balance[]): string {
    if (!balances || balances.length === 0) {
      return 'No balances found.';
    }

    return balances
      .map(
        (balance) =>
          `💰 ${balance.amount} ${balance.currency} (${balance.network})`,
      )
      .join('\n');
  }

  formatTransaction(transaction: Transfer): string {
    const statusEmoji = {
      PENDING: '⏳',
      COMPLETED: '✅',
      FAILED: '❌',
    };

    return `
Transaction ID: ${transaction.id}
Type: ${transaction.type}
Status: ${statusEmoji[transaction.status]} ${transaction.status}
Amount: ${transaction.amount} ${transaction.currency}
Fee: ${transaction.fee}
Recipient: ${transaction.recipient}
${transaction.message ? `Message: ${transaction.message}` : ''}
Date: ${new Date(transaction.createdAt).toLocaleString()}
    `.trim();
  }

  formatProfile(profile: User, kycStatus: KycStatus[]): string {
    const status = kycStatus.length > 0 ? kycStatus[0].status : 'NOT_SUBMITTED';

    const statusEmoji = {
      PENDING: '⏳',
      APPROVED: '✅',
      REJECTED: '❌',
      NOT_SUBMITTED: '📝',
    };

    return `
👤 Profile Information:
Name: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
KYC Status: ${statusEmoji[status]} ${status}
Account Created: ${new Date(profile.createdAt).toLocaleDateString()}
    `.trim();
  }
}
