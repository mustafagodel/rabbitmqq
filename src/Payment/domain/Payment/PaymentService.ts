import { inject, injectable } from 'inversify';
import { Payment } from './Payment';
import { PaymentRepository } from './PaymentRepository';
import { ObjectId } from 'mongodb';

@injectable()
export class PaymentService {
    constructor(@inject(PaymentRepository) private paymentRepository: PaymentRepository) { }

    async complatePayment(price: number,isSuccse:boolean): Promise<Payment | undefined> {

        const payment = new Payment(price,isSuccse);
        const result = await this.paymentRepository.updatePaymentControl(payment);

        if (result.success) {

            return payment;
        }

        return undefined;
    }

}
