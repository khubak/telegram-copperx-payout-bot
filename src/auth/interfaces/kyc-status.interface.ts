export interface KycStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'INDIVIDUAL' | 'BUSINESS';
  createdAt: string;
  updatedAt: string;
}
