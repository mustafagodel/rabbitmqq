import { inject, injectable } from 'inversify';
import { UserRepository } from './UserRepository';
import { User } from './User';
import { SecurityExtension } from '../../../../infrastructure/SecurityExtension';
import { LoginRequest, RegisterRequest } from '../../dto/Response/interfaces';
@injectable()
export class UserService {
    private passwordService: SecurityExtension;
    constructor(public userRepository: UserRepository, @inject(SecurityExtension) passwordService: SecurityExtension) {
        this.passwordService = passwordService;
    }

    async login(username:string,password:string): Promise<{ user?: User } | false> {
        const user = await this.userRepository.findByUsername(username, password);
        const hashedPassword = this.passwordService.hashPassword(password);

        if (user) {
            if (user && hashedPassword === user.password) {
                return { user: user };
            }
        }

        return false;
    }

    async register(username:string,password:string,role:string): Promise<boolean> {
        const user = await this.userRepository.findByUsername(username,password);
        const hashedPassword = this.passwordService.hashPassword(password);
        if (user) {
            return false;
        } else {
            if (!username || !password || !role) {
                return false;
            }
            const newUser = new User(username, hashedPassword,role);
            const addUserResult = await this.userRepository.add(newUser);
            return addUserResult;
        }
    }
}