import { inject, injectable } from 'inversify';
import { MongoDBConnector } from '../../infrastructure/db';
import { Collection } from 'mongodb';
import { ShoppingBasket } from './ShoppingBasket';

@injectable()
export class ShoppingBasketRepository {
    private collection: Collection | undefined;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('shoppingbasket');
    }

    async add(shoppingBasket:ShoppingBasket):Promise<{ success: boolean }> {
        try {
            const result = await this.collection!.insertOne(shoppingBasket);
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
}