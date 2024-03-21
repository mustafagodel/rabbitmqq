import { MongoClient, Db, ClientSession } from 'mongodb';
import { injectable } from 'inversify';
@injectable()
export class MongoDBConnector {
    private client: MongoClient;
    private db: Db;
    constructor() {
        const mongoUrl = process.env.MONGO_URL 
        this.client = new MongoClient(mongoUrl!);
        this.db = this.client.db('StockDatabase');
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db('StockDatabase');
            console.log('the MongoDB connection was succesful:');
        } catch (error) {
            console.error('The MongoDB connection was failed:', error);
            throw error;
        }
    }

    getDb(): Db {
        return this.db;
    }
  
}

