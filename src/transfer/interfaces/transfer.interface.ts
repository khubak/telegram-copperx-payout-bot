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
