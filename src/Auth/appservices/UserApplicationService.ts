import { inject, injectable } from 'inversify';
import { UserService } from '../domain/Users/UserService';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { LoginRequest, RegisterRequest } from '../dto/Response/interfaces';
let token;
@injectable()
export class UserApplicationService {
    [key: string]: any;

    private registeredRole: string | undefined;

    constructor(
        @inject(UserService) private userService: UserService
    ) { }

    private generateToken(role: string): string {
        const secretKey = process.env.SECRET_KEY || 'defaultSecretKey';
        return jwt.sign({ role }, secretKey);
    }

    public async register(messageData: RegisterRequest): Promise<ApiResponse<{ result: string; } | null>> {
        const registerResult = await this.userService.register(messageData);
        if (registerResult) {
            this.registeredRole = messageData.role; 
            return new ApiResponse(0, 'User added successfully', { result: 'Successfully Created in The Recording' });
        } else {
            return new ApiResponse(1, 'Failed to add user', { result: 'Check if the value is left blank or You may already be registered' });
        }
    }

    public async login(request: LoginRequest): Promise<ApiResponse<{ token: string } | null>> {
        const loginResponse = await this.userService.login(request);
        if (loginResponse) {
     
            const token = this.generateToken(this.registeredRole!);
            return new ApiResponse(0, 'Login successful', { token });
        } else {
            return new ApiResponse(1, 'Incorrect Username or Password', null);
        }
    }
}