
import { BaseRequest } from '../../../../infrastructure/BaseRequset'

export interface LoginRequest extends BaseRequest {
    username: string;
    password: string;
}

export interface RegisterRequest extends BaseRequest {
    username: string;
    password: string;
    role: string;
}