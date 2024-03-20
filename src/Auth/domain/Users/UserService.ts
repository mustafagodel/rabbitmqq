import { inject, injectable } from 'inversify';
import { UserRepository } from './UserRepository';
import { User } from './User';
import { SecurityExtension } from '../../../infrastructure/SecurityExtension';
import { LoginRequest, RegisterRequest } from '../../dto/Response/interfaces';
@injectable()
export class UserService {
    private passwordService: SecurityExtension;
    constructor(public userRepository: UserRepository, @inject(SecurityExtension) passwordService: SecurityExtension) {
        this.passwordService = passwordService;
    }

    async login(request: LoginRequest): Promise<{ user?: User } | false> {
        const user = await this.userRepository.findByUsername(request.username, request.password);
        const hashedPassword = this.passwordService.hashPassword(request.password);

        if (user) {
            if (user && hashedPassword === user.password) {
                return { user: user };
            }
        }

        return false;
    }

    async register(request: RegisterRequest): Promise<boolean> {
        const user = await this.userRepository.findByUsername(request.username, request.password);
        const hashedPassword = this.passwordService.hashPassword(request.password);
        if (user) {
            return false;
        } else {
            if (!request.username || !request.password || !request.role) {
                return false;
            }
            const newUser = new User(request.username, hashedPassword, request.role);
            const addUserResult = await this.userRepository.add(newUser);
            return addUserResult;
        }
    }
}