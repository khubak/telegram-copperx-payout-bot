import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePayoutDto, PayoutResponseDto } from '../dto/payout.dto';
import { PayoutService } from './payout.service';

@ApiTags('payouts')
@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payout' })
  @ApiBody({ type: CreatePayoutDto })
  @ApiResponse({
    status: 201,
    description: 'The payout has been successfully created.',
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createPayoutDto: CreatePayoutDto): PayoutResponseDto {
    return this.payoutService.create(createPayoutDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payouts' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by Telegram user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of payouts',
    type: [PayoutResponseDto],
  })
  findAll(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ): PayoutResponseDto[] {
    return this.payoutService.findAll(status, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payout by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the payout' })
  @ApiResponse({
    status: 200,
    description: 'The payout details',
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payout not found.' })
  findOne(@Param('id') id: string): PayoutResponseDto {
    const payout = this.payoutService.findOne(id);
    if (!payout) {
      throw new NotFoundException(`Payout with ID ${id} not found`);
    }
    return payout;
  }
}
