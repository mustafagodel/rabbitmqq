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
exports.UserController = void 0;
const UserService_1 = require("../domain/Users/UserService");
const inversify_1 = require("inversify");
require("reflect-metadata");
const UserApplicationService_1 = require("../appservices/UserApplicationService");
const PasswordService_1 = require("../../infrastructure/PasswordService");
const RabbitMQService_1 = require("../../infrastructure/RabbitMQService");
let UserController = class UserController {
    constructor(userService, passwordService, rabbitmqService1, userAppService) {
        this.userService = userService;
        this.rabbitmqService1 = rabbitmqService1;
        this.userAppService = userAppService;
        this.rabbitmqService1.onMessageReceived((message) => {
            this.handleMessage1(message);
        });
    }
    async handleMessage1(message) {
        const messageData = JSON.parse(message);
        if (messageData.action === 'login') {
            const response = await this.userAppService.loginUser(messageData.username, messageData.password);
            const responseMessage = {
                action: 'login_response',
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.rabbitmqService1.sendMessage(responseMessageText, (error) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                }
                else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }
        else if (messageData.action === 'register') {
            const registrationResponse = await this.userAppService.registerUser(messageData.username, messageData.password);
            console.log('Register response:', registrationResponse);
            const responseMessage = {
                action: 'register_response',
                response: registrationResponse,
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.rabbitmqService1.sendMessage(responseMessageText, (error) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                }
                else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(UserService_1.UserService)),
    __param(1, (0, inversify_1.inject)(PasswordService_1.PasswordService)),
    __param(2, (0, inversify_1.inject)('RabbitMQServiceQueue1')),
    __param(3, (0, inversify_1.inject)(UserApplicationService_1.UserApplicationService)),
    __metadata("design:paramtypes", [UserService_1.UserService,
        PasswordService_1.PasswordService,
        RabbitMQService_1.RabbitMQService,
        UserApplicationService_1.UserApplicationService])
], UserController);
//# sourceMappingURL=app.js.map