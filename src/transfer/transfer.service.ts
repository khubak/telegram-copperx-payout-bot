import { Injectable } from '@nestjs/common';
import { ApiService } from '../shared/http/api.service';
import { EmailTransferDto } from './dto/email-transfer.dto';
import { WalletTransferDto } from './dto/wallet-transfer.dto';
import { BankWithdrawalDto } from './dto/bank-withdrawal.dto';
import { Transfer } from './interfaces/transfer.interface';
import { TransferHistory } from './interfaces/transfer-history.interface';

@Injectable()
export class TransferService {
  constructor(private readonly apiService: ApiService) {}

  async sendEmailTransfer(dto: EmailTransferDto): Promise<Transfer> {
    return this.apiService.post<Transfer>('/transfers/send', dto);
  }

  async sendWalletTransfer(dto: WalletTransferDto): Promise<Transfer> {
    return this.apiService.post<Transfer>('/transfers/wallet-withdraw', dto);
  }

  async sendBankWithdrawal(dto: BankWithdrawalDto): Promise<Transfer> {
    return this.apiService.post<Transfer>('/transfers/offramp', dto);
  }

  async getTransferHistory(page = 1, limit = 10): Promise<TransferHistory> {
    return this.apiService.get<TransferHistory>(
      `/transfers?page=${page}&limit=${limit}`,
    );
  }
}
