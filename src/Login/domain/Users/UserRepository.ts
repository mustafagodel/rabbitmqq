import { Collection } from 'mongodb';
import { inject, injectable } from 'inversify';
import { User } from './User';
import { MongoDBConnector } from '../../../infrastructure/db';
import  { PasswordService } from '../../../infrastructure/PasswordService';


@injectable()
export class UserRepository {
    private collection: Collection | undefined;
    private passwordService: PasswordService;
    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector,@inject(PasswordService) passwordService: PasswordService) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('users'); 
        this.passwordService = passwordService;
    }
   

    async findByUsername(username: string, password: string): Promise<{ success: boolean; user?: User }> {
        if (!this.collection) {
            return { success: false };
        }

        try {
            const hashedPassword = this.passwordService.hashPassword(password);
            const userDoc = await this.collection.findOne({ username, password: hashedPassword });

            if (!userDoc) {
                return { success: false };
            }

            const user: User = new User(userDoc.username, userDoc.password);

            return { success: true, user };
        } catch (error) {
            console.error('MongoDB sorgusu hatası:', error);
            throw error;
        }
    }

    async add(user: User): Promise<{ success: boolean }> {
        // if (!this.collection) {
        //     return { success: false };
        // }

       try {
  const result = await this.collection!.insertOne(user);
  if (result.acknowledged) {
    return { success: true };
  } else {
    console.error('Ekleme işlemi başarısız:', result.acknowledged);
    return { success: false };
  }
} catch (error) {
  console.error('MongoDB ekleme hatası:', error);
  return { success: false };
}
    }}

