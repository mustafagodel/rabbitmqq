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
exports.UserApplicationService = exports.UserController = void 0;
const UserService_1 = require("../domain/Users/UserService");
const inversify_1 = require("inversify");
require("reflect-metadata");
const UserApplicationService_1 = require("../appservices/UserApplicationService");
Object.defineProperty(exports, "UserApplicationService", { enumerable: true, get: function () { return UserApplicationService_1.UserApplicationService; } });
const PasswordService_1 = require("../../infrastructure/PasswordService");
const RabbitMQService_1 = require("../../infrastructure/RabbitMQService");
let UserController = class UserController {
    constructor(userService, passwordService, userAppService) {
        this.userService = userService;
        this.userAppService = userAppService;
        this.rabbitmqService = new RabbitMQService_1.RabbitMQService('amqp://localhost', 'Queue');
        this.setupRabbitMQ();
    }
    setupRabbitMQ() {
        this.rabbitmqService.onMessageReceived((message) => {
            this.handleMessage(message);
        });
    }
    async handleMessage(message) {
        const messageData = JSON.parse(message);
        if (messageData.action === 'login') {
            const response = await this.userAppService.loginUser(messageData.username, messageData.password);
            console.log('Login response:', response);
        }
        else if (messageData.action === 'register') {
            const registrationResponse = await this.userAppService.registerUser(messageData.username, messageData.password);
            console.log('Register response:', registrationResponse);
        }
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(UserService_1.UserService)),
    __param(1, (0, inversify_1.inject)(PasswordService_1.PasswordService)),
    __param(2, (0, inversify_1.inject)(UserApplicationService_1.UserApplicationService)),
    __metadata("design:paramtypes", [UserService_1.UserService, PasswordService_1.PasswordService, UserApplicationService_1.UserApplicationService])
], UserController);
//# sourceMappingURL=app.js.map