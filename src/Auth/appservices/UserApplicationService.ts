import { inject, injectable } from 'inversify';
import { UserService } from '../domain/Users/UserService';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { LoginRequest, RegisterRequest } from '../dto/Response/interfaces';
let token;
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

    public async register(messageData: RegisterRequest): Promise<ApiResponse<{ result: string; } | null>> {
        const registerResult = await this.userService.register(messageData);
        const response = registerResult ? new ApiResponse(0, 'User added successfully', { result: 'Successfully Created in The Recording' }) : new ApiResponse(1, 'Failed to add user', { result: 'Check if the value is left blank or You may already be registered' });
        token = this.generateToken(messageData.role);
        console.log(token);
        return response;
    }

    public async login(request: LoginRequest): Promise<ApiResponse<{ token: string } | null>> {

        const loginResponse = await this.userService.login(request);
        const response = loginResponse ? new ApiResponse(0, 'Login successful', { token: this.generateToken(token!) }) : new ApiResponse(1, 'Incorrect Username or Password', null);
        return response;

    }
}
