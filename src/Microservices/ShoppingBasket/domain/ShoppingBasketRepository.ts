import { inject, injectable } from 'inversify';
import { MongoDBConnector } from '../db';
import { Collection, ObjectId } from 'mongodb';
import { ShoppingBasket } from './ShoppingBasket';

@injectable()
export class ShoppingBasketRepository {
    private collection: Collection | undefined;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        this.connect();
    }

    private async connect() {
        try {
            await this.databaseConnector.connect();
            this.collection = this.databaseConnector.getDb()?.collection('shoppingbasket');
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
    }

    async add(shoppingBasket: ShoppingBasket): Promise<{ success: boolean }> {
        try {
            if (!this.collection) {
                throw new Error('Database connection not established');
            }

            const result = await this.collection.insertOne(shoppingBasket);

            if (result.acknowledged) {
                return { success: true };
            } else {
                console.error('The insertion operation failed:', result.acknowledged);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB insertion error:', error);
            return { success: false };
        }
    }

    async findById(id: ObjectId): Promise<ShoppingBasket | undefined> {
        try {
            if (!this.collection) {
                throw new Error('Database connection not established');
            }

            const shoppingBasketMessage = await this.collection.findOne({ userId: id });

            if (!shoppingBasketMessage) {
                return undefined;
            }

            const basket = new ShoppingBasket(shoppingBasketMessage.userId, shoppingBasketMessage.items,shoppingBasketMessage.totalPrice,shoppingBasketMessage.Invoicedetail,shoppingBasketMessage.deliveryAddress);
            basket.userId = shoppingBasketMessage.userId;
         
            return basket;
        } catch (error) {
            console.error('MongoDB query error:', error);
            return undefined;
        }
    }

    async delete(id: ObjectId): Promise<{ success: boolean }> {
        try {
            if (!this.collection) {
                throw new Error('Database connection not established');
            }

            const result = await this.collection.deleteOne({ userId: id });

            if (result.deletedCount && result.deletedCount > 0) {
                return { success: true };
            } else {
                console.error('The deletion operation failed:', result);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB deletion error:', error);
            return { success: false };
        }
    }
}
