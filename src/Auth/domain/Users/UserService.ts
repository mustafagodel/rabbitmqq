import { inject, injectable } from 'inversify';
import { UserRepository } from './UserRepository';
import { User } from './User';
import { SecurityExtension } from '../../../infrastructure/SecurityExtension';

@injectable()
export class UserService {
    private passwordService: SecurityExtension;
    constructor(public userRepository: UserRepository, @inject(SecurityExtension) passwordService: SecurityExtension) {
        this.passwordService = passwordService;
    }

    async login(username: string, password: string): Promise<{ success: boolean; user?: User }> {
        const result = await this.userRepository.findByUsername(username, password);
        const hashedPassword = this.passwordService.hashPassword(password);

        if (result.success) {
            const user = result.user;

            if (user && hashedPassword === user.password) {
                return { success: true, user: user };
            }
        }

        return { success: false };
    }

    async register(username: string, password: string, role: string): Promise<boolean> {
        const existingUserResult = await this.userRepository.findByUsername(username, password);
        const hashedPassword = this.passwordService.hashPassword(password);
        if (existingUserResult.success) {
            const existingUser = existingUserResult.user;

            if (existingUser) {
                const inputPasswordHash = this.passwordService.hashPassword(password);
                if (inputPasswordHash === existingUser.password) {
                    return false;
                }
            }
        }

        const newUser = new User(username, hashedPassword, role);
        const addUserResult = await this.userRepository.add(newUser);
        if (addUserResult.success) {
            return true;
        }

        return false;


    }

}
