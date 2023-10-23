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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const inversify_1 = require("inversify");
const UserRepository_1 = require("./UserRepository");
const User_1 = require("./User");
const PasswordService_1 = require("../../infrastructure/PasswordService");
let UserService = class UserService {
    constructor(userRepository, passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }
    async login(username, password) {
        const result = await this.userRepository.findByUsername(username, password);
        const hashedPassword = this.passwordService.hashPassword(password);
        ;
        if (result.success) {
            const user = result.user;
            if (user && hashedPassword === hashedPassword) {
                return true;
            }
        }
        return false;
    }
    async register(username, password) {
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
        const newUser = new User_1.User(username, hashedPassword);
        const addUserResult = await this.userRepository.add(newUser);
        if (addUserResult.success) {
            return true;
        }
        return false;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, inversify_1.injectable)(),
    __param(1, (0, inversify_1.inject)(PasswordService_1.PasswordService)),
    __metadata("design:paramtypes", [UserRepository_1.UserRepository, PasswordService_1.PasswordService])
], UserService);
//# sourceMappingURL=UserService.js.map