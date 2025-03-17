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
