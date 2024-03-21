

import { inject, injectable } from 'inversify';
import { MongoDBConnector } from '../../db';
import { Collection, ObjectId } from 'mongodb';
import { Payment } from './Payment';

@injectable()
export class PaymentRepository {
    private collection: Collection | undefined;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        this.connect();
    }

    private async connect() {
        try {
            await this.databaseConnector.connect();
            this.collection = this.databaseConnector.getDb()?.collection('payments');
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
    }

    async updatePaymentControl(payment:Payment): Promise<boolean> {


        const randomNumber = Math.random() * 5;
        if (randomNumber === 0) {
          return false;
        } else {
            await this.collection!.insertOne({
                userId: payment.userId,
                amount: payment.amount,
                success: "payment successful",
                date: new Date(),
            });
        }
            return  true ;
        }
    }

