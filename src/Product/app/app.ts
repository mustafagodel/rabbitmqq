import { Request, Response, Router } from 'express';
import { ProductService } from '../domain/Product/ProductService';
import { inject, injectable } from 'inversify';
import express from 'express';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ProductApplicationService } from '../appservices/ProductApplicationService';
import { RabbitMQService } from '../../infrastructure/RabbitMQService';
import 'reflect-metadata';
@injectable()
export class ProductController {
    private readonly router: Router;
    private readonly productAppService: ProductApplicationService;
  

    constructor(
        @inject(ProductService) private productService: ProductService,
        @inject('RabbitMQServiceQueue2') private rabbitmqService1: RabbitMQService,
        @inject(ProductApplicationService) private productApplicationService: ProductApplicationService,
    ) {
        this.router = express.Router();
        this.productAppService = productApplicationService;

        this.rabbitmqService1.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
    }
    
    public async handleMessage(message: string) {
        const messageData = JSON.parse(message);
        if (messageData.action === 'create') {
            const createResult = await this.productAppService.createProduct(messageData.name,messageData.price,messageData.stock );
    
            const responseMessage = {
                action: 'create_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        

        }
       else if (messageData.action === 'update') {
            const createResult = await this.productAppService.updateProduct(
                messageData.id,
                messageData.name,
                messageData.price,
                messageData.stock
            );
    
            const responseMessage = {
                action: 'update_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }
        
        else if (messageData.action === 'delete') {
            const createResult = await this.productAppService.deleteProduct(
                messageData.id,
            );
    
            const responseMessage = {
                action: 'delete_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }  else if (messageData.action === 'get') {
            const createResult = await this.productAppService.getProductById(
                messageData.id,
            );
            const responseMessage = {
                action: 'get_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }else if (messageData.action === 'getAll') {
            const createResult = await this.productAppService.getAllProducts();
    
            const responseMessage = {
                action: 'getAll_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }
    }
}