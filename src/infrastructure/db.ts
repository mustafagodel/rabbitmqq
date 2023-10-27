import { MongoClient, Db } from 'mongodb';
import { inject, injectable } from 'inversify';
@injectable()
export class MongoDBConnector {
    private client: MongoClient;
    private db: Db;
    constructor() {
        this.client = new MongoClient('mongodb://localhost:27017', {
        
        });
        this.db = this.client.db("Database1"); 
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db('Database1'); 
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
