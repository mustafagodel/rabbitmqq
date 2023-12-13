import { Collection } from 'mongodb';
import { inject, injectable } from 'inversify';
import { User } from './User';
import { MongoDBConnector } from '../../../infrastructure/db';
import { SecurityExtension } from '../../../infrastructure/SecurityExtension';

@injectable()
export class UserRepository {
    private collection: Collection | undefined;
    private passwordService: SecurityExtension;

    constructor(
        @inject(MongoDBConnector) private databaseConnector: MongoDBConnector,
        @inject(SecurityExtension) passwordService: SecurityExtension
    ) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('users');
        this.passwordService = passwordService;
    }

    async findByUsername(username: string, password: string): Promise<{ success: boolean; user?: any }> {
        if (!this.collection) {
            return { success: false };
        }

        const hashedPassword = this.passwordService.hashPassword(password);
        const userDoc = await this.collection.findOne({ username, password: hashedPassword });

        if (!userDoc) {
            return { success: false };
        }

        return { success: true, user: userDoc };
    }

    async add(user: User): Promise<{ success: boolean }> {
        const result = await this.collection!.insertOne(user);

        if (result.acknowledged) {
            return { success: true };
        } 
            console.error('The insertion operation failed: ', result.acknowledged);
            return { success: false };
        }
}
