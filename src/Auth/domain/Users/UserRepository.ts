import { Collection } from 'mongodb';
import { inject, injectable } from 'inversify';
import { User } from './User';
import { MongoDBConnector } from '../../db';
import { SecurityExtension } from '../../../infrastructure/SecurityExtension';
import { LoginRequest,RegisterRequest } from '../../dto/Response/interfaces';
@injectable()
export class UserRepository {
    private collection: Collection<User> | undefined;
    private passwordService: SecurityExtension;

    constructor(
        @inject(MongoDBConnector) private databaseConnector: MongoDBConnector,
        @inject(SecurityExtension) passwordService: SecurityExtension
    ) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection<User>('users');
        this.passwordService = passwordService;
    }

    async findByUsername(username: string, password: string): Promise<User | null> {

        const hashedPassword = this.passwordService.hashPassword(password);
        const userDoc = await this.collection!.findOne({ username, password: hashedPassword });

        if (!userDoc) {
            return null;
        }

        return userDoc;
    }

    async add(user: User): Promise<boolean> {
        const result = await this.collection!.insertOne(user);

        if (result.acknowledged) {
            return  true;
        }
        console.error('The insertion operation failed: ', result.acknowledged);
        return false ;
    }
}
