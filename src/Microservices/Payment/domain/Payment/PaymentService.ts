import { inject, injectable } from 'inversify';
import { Payment } from './Payment';
import { PaymentRepository } from './PaymentRepository';
import { IPaymentData } from '../../dto/Response/interfaces';
import { ObjectId } from 'mongodb';

@injectable()
export class PaymentService {
    constructor(@inject(PaymentRepository) private paymentRepository: PaymentRepository) { }

    async complatePayment(price:number,userId:ObjectId): Promise<Payment | undefined> {

        const payment = new Payment(price,userId);
        const result = await this.paymentRepository.updatePaymentControl(payment);

        if (result) {

            return payment;
        }

        return undefined;
    }

}
