import { injectable, inject } from 'inversify';
import { MongoDBConnector } from './db';
import { Collection, IntegerType, ObjectId } from 'mongodb';

@injectable()
export class Stock {
    private collection: Collection | null = null;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('stock');
    }

    async Stock(productId: ObjectId, Stok: number, operation: 'increase stok' | 'decrease stok' | 'update stok' | 'rollback stok'): Promise<{ success: boolean }> {

        const timestamp = new Date();
        const result = await this.collection!.insertOne({ productId, Stok, operation, timestamp });

        if (result.acknowledged) {
            return { success: true };
        } else {
            console.error('The insertion operation failed:', result.acknowledged);
            return { success: false };
        }
    }

    async getStock(): Promise<any[]> {
        return this.collection!.find().toArray();
    }
}