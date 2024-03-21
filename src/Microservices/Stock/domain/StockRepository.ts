import { injectable, inject } from 'inversify';
import { MongoDBConnector } from '../db';
import { Stock } from './Stock';
import { Collection } from 'mongodb';

@injectable()
export class StockRepository {
    private collection: Collection | undefined;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        this.connect();
    }

    private async connect() {
        try {
            await this.databaseConnector.connect();
            this.collection = this.databaseConnector.getDb()?.collection('stocks');
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
    }

  
    async addStock(stock: Stock): Promise<boolean> {
        const timestamp = new Date();
        try {
            const insertResult = await this.collection!.insertOne({
                productId: stock.productId,
                Stok: stock.quantity,
                operation: stock.operation,
                timestamp: timestamp
            });
            return insertResult.acknowledged;
        } catch (error) {
            console.error('Error inserting stock record:', error);
            return false;
        }
    }
}
