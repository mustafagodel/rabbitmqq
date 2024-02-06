import { MongoClient, Db, ClientSession } from 'mongodb';
import { inject, injectable } from 'inversify';
@injectable()
export class MongoDBConnector {
    private client: MongoClient;
    private db: Db;
    constructor() {
        this.client = new MongoClient('mongodb://localhost:27017', {
        
        });
        this.db = this.client.db("ProjectDatabase"); 
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db('ProjectDatabase'); 
            console.log('the MongoDB connection was succesful:');
        } catch (error) {
            console.error('The MongoDB connection was failed:', error);
            throw error;
        }
    }

    getDb(): Db { 
        return this.db;
    }
    async startTransaction(): Promise<ClientSession> {
        const session: ClientSession = this.client.startSession();
         session.startTransaction();
        return session;
    }

    async commitTransaction(session: ClientSession): Promise<void> {
        await session.commitTransaction();
        session.endSession();
    }

    async abortTransaction(session: ClientSession): Promise<void> {
        await session.abortTransaction();
        session.endSession();
    }
    async rollbackTransaction(session: ClientSession): Promise<void> {
        try {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
        } finally {
            session.endSession();
        }
    }
}

