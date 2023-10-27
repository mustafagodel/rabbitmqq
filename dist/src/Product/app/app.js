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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const ProductService_1 = require("../domain/Product/ProductService");
const inversify_1 = require("inversify");
const express_1 = __importDefault(require("express"));
const ProductApplicationService_1 = require("../appservices/ProductApplicationService");
const RabbitMQService_1 = require("../../infrastructure/RabbitMQService");
require("reflect-metadata");
let ProductController = class ProductController {
    constructor(productService, rabbitmqService1, productApplicationService) {
        this.productService = productService;
        this.rabbitmqService1 = rabbitmqService1;
        this.productApplicationService = productApplicationService;
        this.router = express_1.default.Router();
        this.productAppService = productApplicationService;
        this.rabbitmqService1.onMessageReceived((message) => {
            this.handleMessage1(message);
        });
    }
    async handleMessage1(message) {
        const messageData = JSON.parse(message);
        if (messageData.action === 'create') {
            const createResult = await this.productAppService.createProduct(messageData.name, messageData.price, messageData.stock);
            const responseMessage = {
                action: 'create_response',
                response: createResult,
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
        else if (messageData.action === 'update') {
            const createResult = await this.productAppService.updateProduct(messageData.id, messageData.name, messageData.price, messageData.stock);
            const responseMessage = {
                action: 'update_response',
                response: createResult,
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
        else if (messageData.action === 'delete') {
            const createResult = await this.productAppService.deleteProduct(messageData.id);
            const responseMessage = {
                action: 'delete_response',
                response: createResult,
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
        else if (messageData.action === 'get') {
            const createResult = await this.productAppService.getProductById(messageData.id);
            const responseMessage = {
                action: 'get_response',
                response: createResult,
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
        else if (messageData.action === 'getAll') {
            const createResult = await this.productAppService.getAllProducts();
            const responseMessage = {
                action: 'getAll_response',
                response: createResult,
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
exports.ProductController = ProductController;
exports.ProductController = ProductController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ProductService_1.ProductService)),
    __param(1, (0, inversify_1.inject)('RabbitMQServiceQueue2')),
    __param(2, (0, inversify_1.inject)(ProductApplicationService_1.ProductApplicationService)),
    __metadata("design:paramtypes", [ProductService_1.ProductService,
        RabbitMQService_1.RabbitMQService,
        ProductApplicationService_1.ProductApplicationService])
], ProductController);
//# sourceMappingURL=app.js.map