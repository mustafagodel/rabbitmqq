import { Request, Response, Router } from 'express';
import { ProductService } from '../domain/Product/ProductService';
import { inject, injectable } from 'inversify';
import express from 'express';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ProductApplicationService } from '../appservices/ProductApplicationService';
import { RabbitMQService } from '../../infrastructure/RabbitMQService';
import 'reflect-metadata';
import { OrderItem } from '../../Order/domain/Product/Order';
@injectable()
export class ProductApp {
    private readonly router: Router;
    private readonly productAppService: ProductApplicationService;
  

    constructor(
        @inject(ProductService) private productService: ProductService,
        @inject('ProductRabbitMQServiceQueue') private productrabbitmqService: RabbitMQService,
        @inject(ProductApplicationService) private productApplicationService: ProductApplicationService,
    ) {
        this.router = express.Router();
        this.productAppService = productApplicationService;
        this.productrabbitmqService = productrabbitmqService;

        this.productrabbitmqService.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
    }
    
    public async handleMessage(message: string) {
        const messageData = JSON.parse(message);

        const func = this.functions[messageData.action];

        if(!func) {

            throw new Error("undefined method");            
         
        }

        return await func(this.productApplicationService, messageData, this.productrabbitmqService);
    }





       
    public  functions = {
        async create(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const createResult = await productAppService.createProduct(messageData.type,messageData.name,messageData.price,messageData.stock );
    
            const responseMessage = {
                action: 'create_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('The response message has been sent to RabbitMQ.');
                }
            });
        },
        async update(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const createResult = await productAppService.updateProduct(
                messageData.id,
                messageData.type,
                messageData.name,
                messageData.price,
                messageData.stock
            );
    
            const responseMessage = {
                action: 'update_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                  } else {
                     console.log('The response message has been sent to RabbitMQ.');
                }
            });
        }, async delete(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const createResult = await productAppService.deleteProduct(
                messageData.id,
            );
    
            const responseMessage = {
                action: 'delete_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('The response message has been sent to RabbitMQ.');
                }
            });
        }, async get(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const createResult = await productAppService.getProductById(
                messageData.id,
            );
            const responseMessage = {
                action: 'get_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }, async getAll(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const createResult = await productAppService.getAllProducts();
    
            const responseMessage = {
                action: 'getAll_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }
      };
     
      async checkAndDecreaseStock(messageData: any) {
  
         
            const itemsArray: string[] = JSON.parse(messageData.items.replace(/'/g, '"'));
            const productName: string = itemsArray[0];
            const stockAsString: string = itemsArray[1];
            const product = await this.productAppService.getProductByName(productName);
        
       
            console.log('Retrieved product:', product);
        
            if (!product) {
                return 'error';
            }
            const stockAsNumber = parseFloat(stockAsString);
 
            if (product.data.stock >= stockAsNumber) {
                return 'succes';
        
              
            } else {
                return 'insufficient_stock'; 
            }
        }
    
    async getname(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
        const createResult = await productAppService.getProductByName(
            messageData.name,
        );

        const responseMessage = {
            action: 'getname_response',
            response: createResult,
        };
        const responseMessageText = JSON.stringify(responseMessage);

        rabbitmqService.sendMessage(responseMessageText, (error: any) => {
            if (error) {
                console.error('RabbitMQ connection or sending error:', error);
            } else {
                console.log('Response message has been sent to RabbitMQ.');
            }
        });
    }
}