import { Transfer } from './transfer.interface';

export interface TransferHistory {
  items: Transfer[];
  total: number;
  page: number;
  limit: number;
}
