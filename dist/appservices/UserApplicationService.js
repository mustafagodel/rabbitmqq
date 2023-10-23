"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserApplicationService = void 0;
const inversify_1 = require("inversify");
const UserService_1 = require("../domain/Users/UserService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiResponse_1 = require("../infrastructure/ApiResponse");
require('dotenv').config();
let UserApplicationService = class UserApplicationService {
    constructor(userService) {
        this.userService = userService;
    }
    async registerUser(username, password) {
        const message = await this.userService.register(username, password);
        if (message) {
            return new ApiResponse_1.ApiResponse(0, 'User added successfully', message);
        }
        else {
            return new ApiResponse_1.ApiResponse(0, 'No user added', message);
        }
    }
    async loginUser(username, password) {
        const message = await this.userService.login(username, password);
        if (message) {
            const secretKey = process.env.SECRET_KEY;
            if (!secretKey || typeof secretKey !== 'string') {
                console.error('SECRET_KEY is missing or invalid.');
                return new ApiResponse_1.ApiResponse(1, 'Internal Server Error: Invalid SECRET_KEY', 'Invalid secret key');
            }
            const token = jsonwebtoken_1.default.sign({ username }, secretKey);
            console.log(`Token after successful login: ${token}`);
            return new ApiResponse_1.ApiResponse(0, 'Login successful', { token });
        }
        else {
            return new ApiResponse_1.ApiResponse(1, 'Incorrect Username or Password', false);
        }
    }
};
exports.UserApplicationService = UserApplicationService;
exports.UserApplicationService = UserApplicationService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [UserService_1.UserService])
], UserApplicationService);
//# sourceMappingURL=UserApplicationService.js.map