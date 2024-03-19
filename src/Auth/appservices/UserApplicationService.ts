import { inject, injectable } from 'inversify';
import { UserService } from '../domain/Users/UserService';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';

interface MessageData {
    action: string;
    username: string;
    password: string;
    role: string;
}


interface BaseRequest {
    action: string;
}
interface LoginRequest extends BaseRequest {
    username: string;
    password: string;
    role: string;
}

interface RegisterRequest extends BaseRequest {
    username: string;
    password: string;
    role: string;
}

@injectable()
export class UserApplicationService {
    [key: string]: any;

    constructor(
        @inject(UserService) private userService: UserService
    ) { }

    private generateToken(role: string): string {
        const secretKey = process.env.SECRET_KEY || 'defaultSecretKey';
        return jwt.sign({ role }, secretKey);
    }

    public async register(messageData: RegisterRequest): Promise<ApiResponse<boolean>> {

        const { action, username, password, role } = messageData;
        const registerResponse = await this.userService.register(username, password, role);
        const response = new ApiResponse(0, 'User added successfully', registerResponse);

        return response;
    }

    public async login(request: LoginRequest): Promise<ApiResponse<{ token: string } | null>> {

        const loginResponse = await this.userService.login(request.username, request.password);
        const response = loginResponse.success ? new ApiResponse(0, 'Login successful', { token: this.generateToken(request.role) }) : new ApiResponse(1, 'Incorrect Username or Password', null);

        return response;

    }
}
