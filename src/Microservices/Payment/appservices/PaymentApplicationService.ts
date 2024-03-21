

import { inject, injectable } from 'inversify';
import { ApiResponse } from '../../../infrastructure/ApiResponse';
import { PaymentService } from '../domain/Payment/PaymentService';
import { IPaymentData } from '../dto/Response/interfaces';

@injectable()
export class PaymentApplicationService {
    [x: string]: any;
    constructor(
        @inject(PaymentService) private paymentService: PaymentService
    ) { }

    async processPayment(payment:IPaymentData): Promise<ApiResponse<any>> {
        try {
            const paymentResult = await this.paymentService.complatePayment(payment.price,payment.userId);
            if (!paymentResult) {
                return new ApiResponse(0, 'Failed to update payment control', "insufficient_balance");
            }
            return new ApiResponse(1, 'Payment processed successfully', "succes");
        } catch (error) {
            console.error('Error processing payment:', error);
            return new ApiResponse(1, 'Error processing payment', null);
        }
    }
}
