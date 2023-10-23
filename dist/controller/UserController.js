"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../domain/Users/UserService");
const inversify_1 = require("inversify");
require("reflect-metadata");
const UserApplicationService_1 = require("../appservices/UserApplicationService");
const amqp = __importStar(require("amqplib/callback_api"));
const PasswordService_1 = __importDefault(require("../infrastructure/PasswordService"));
let UserController = class UserController {
    constructor(userService, passwordService) {
        this.userService = userService;
        this.userAppService = new UserApplicationService_1.UserApplicationService(userService);
        this.setupRabbitMQ();
    }
    setupRabbitMQ() {
        const rabbitmqServer = 'amqp://localhost'; // RabbitMQ sunucu adresi
        const queueName = 'Queue';
        amqp.connect(rabbitmqServer, (error, connection) => {
            if (error) {
                console.error('RabbitMQ bağlantı hatası:', error);
                return;
            }
            connection.createChannel((error, channel) => {
                if (error) {
                    console.error('RabbitMQ kanalı oluşturma hatası:', error);
                    connection.close();
                    return;
                }
                channel.assertQueue(queueName, { durable: false });
                console.log(`Listening for messages in ${queueName}...`);
                channel.consume(queueName, (message) => {
                    if (message) {
                        const messageContent = message.content.toString();
                        console.log(`Received message: ${messageContent}`);
            
                        this.handleMessage(messageContent, channel, message);
                    }
                });
            });
        });
    }
    async handleMessage(messageContent, channel, amqpMessage) {

        const message = JSON.parse(messageContent);
        if (message.action === 'login') {
            const response = await this.userAppService.loginUser(message.username, message.password);
       
            console.log('Login response:', response);
        }
        else if (message.action === 'register') {
            const loginuser = await this.userAppService.registerUser(message.username, message.password);
            console.log('register response:', loginuser);
        }
        
        channel.ack(amqpMessage);
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(UserService_1.UserService)),
    __param(1, (0, inversify_1.inject)(PasswordService_1.default)),
    __metadata("design:paramtypes", [UserService_1.UserService, PasswordService_1.default])
], UserController);
exports.default = UserController;
//# sourceMappingURL=UserController.js.map