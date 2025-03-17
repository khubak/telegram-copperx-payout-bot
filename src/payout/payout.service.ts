import { Injectable } from '@nestjs/common';
import { CreatePayoutDto, PayoutResponseDto } from '../dto/payout.dto';

@Injectable()
export class PayoutService {
  private readonly payouts: PayoutResponseDto[] = [];

  create(createPayoutDto: CreatePayoutDto): PayoutResponseDto {
    const payout: PayoutResponseDto = {
      id: this.generateId(),
      userId: createPayoutDto.userId,
      amount: createPayoutDto.amount,
      currency: createPayoutDto.currency,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      notes: createPayoutDto.notes,
    };

    this.payouts.push(payout);
    return payout;
  }

  findAll(status?: string, userId?: string): PayoutResponseDto[] {
    let result = [...this.payouts];

    if (status) {
      result = result.filter((payout) => payout.status === status);
    }

    if (userId) {
      result = result.filter((payout) => payout.userId === userId);
    }

    return result;
  }

  findOne(id: string): PayoutResponseDto | undefined {
    return this.payouts.find((payout) => payout.id === id);
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
