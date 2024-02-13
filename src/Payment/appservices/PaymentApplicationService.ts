// PaymentApplicationService.ts

import { inject, injectable } from 'inversify';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ObjectId } from 'mongodb';
import { OrderService } from '../../Order/domain/Order/OrderService';
import { PaymentRepository } from '../domain/Payment/PaymentRepository';
import { PaymentService } from '../domain/Payment/PaymentService';

@injectable()
export class PaymentApplicationService {
    constructor(
        @inject(OrderService) private orderService: OrderService,
        @inject(PaymentService) private paymentService: PaymentService
    ) { }

    async processPayment(amount: number): Promise<ApiResponse<any>> {
        try {
            const paymentResult = await this.paymentService.complatePayment(amount,true);
            if (!paymentResult) {
                return new ApiResponse(1, 'Failed to update payment control', null);
            }
            return new ApiResponse(0, 'Payment processed successfully', null);
        } catch (error) {
            console.error('Error processing payment:', error);
            return new ApiResponse(1, 'Error processing payment', null);
        }
    }
}
