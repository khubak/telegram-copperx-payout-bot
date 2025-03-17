import { Injectable } from '@nestjs/common';
import { ApiService } from '../shared/http/api.service';
import { DefaultWalletDto } from './dto/default-wallet.dto';
import { Wallet } from './interfaces/wallet.interface';
import { Balance } from './interfaces/balance.interface';

@Injectable()
export class WalletService {
  constructor(private readonly apiService: ApiService) {}

  async getWallets(): Promise<Wallet[]> {
    return this.apiService.get<Wallet[]>('/wallets');
  }

  async getBalances(): Promise<Balance[]> {
    return this.apiService.get<Balance[]>('/wallets/balances');
  }

  async setDefaultWallet(dto: DefaultWalletDto): Promise<Wallet> {
    return this.apiService.put<Wallet>('/wallets/default', dto);
  }
}
