import { inject, injectable } from 'inversify';
import { UserRepository } from './UserRepository';
import { User } from './User';
import  { PasswordService } from '../../../infrastructure/PasswordService';

@injectable()
export class UserService {
    private passwordService: PasswordService;
    constructor(public userRepository: UserRepository,@inject(PasswordService) passwordService: PasswordService) {
        this.passwordService = passwordService;
    }

    async login(username: string, password: string): Promise<boolean> {
        const result = await this.userRepository.findByUsername(username, password);
        const hashedPassword = this.passwordService.hashPassword(password);;
        if (result.success) {
            const user = result.user;
            if (user && hashedPassword === hashedPassword) {
                return true;
            }
        }
        return false;
    }

    async register(username: string, password: string): Promise<boolean> {
        const existingUserResult = await this.userRepository.findByUsername(username, password);
        const hashedPassword = this.passwordService.hashPassword(password);
        if (existingUserResult.success) {
            const existingUser = existingUserResult.user;
        
            if (existingUser) {
                const inputPasswordHash =this.passwordService.hashPassword(password);
                if (inputPasswordHash === existingUser.password) {
                    return false;
                }
            }
        }
     
        const newUser = new User(username, hashedPassword);
        const addUserResult = await this.userRepository.add(newUser);
        if (addUserResult.success) {
            return true;
        }

        return false; 

        
    }
}
