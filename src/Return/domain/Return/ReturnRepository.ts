import { inject, injectable } from 'inversify';
import { Return } from './Return';
import { MongoDBConnector } from '../../../infrastructure/db';
import { Collection } from 'mongodb';

@injectable()
export class ReturnRepository {
    private collection: Collection | undefined;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('returns');
    }

    async add(returnItem: Return): Promise<{ success: boolean }> {
        try {
            const result = await this.collection!.insertOne(returnItem);
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