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
        @inject('RabbitMQServiceQueue2') private rabbitmqService1: RabbitMQService
    ) {
        this.router = express.Router();
        this.productAppService = new ProductApplicationService(productService);

        this.rabbitmqService1.onMessageReceived((message: string) => {
            this.handleMessage1(message);
        });
    }
    
    public async handleMessage1(message: string) {
        const messageData = JSON.parse(message);
        if (messageData.action === 'create') {
            const createResult = await this.productAppService.createProduct(messageData.name,messageData.price,messageData.stock );
    
            console.log('result', createResult);

        }
       else if (messageData.action === 'update') {
            const createResult = await this.productAppService.updateProduct(
                messageData.id,
                messageData.name,
                messageData.price,
                messageData.stock
            );
    
            console.log('result', createResult);
        }
        else if (messageData.action === 'delete') {
            const createResult = await this.productAppService.deleteProduct(
                messageData.id,
            );
    
            console.log('result', createResult);
        }  else if (messageData.action === 'get') {
            const createResult = await this.productAppService.getProductById(
                messageData.id,
            );
    
            console.log('result', createResult);
        }else if (messageData.action === 'getAll') {
            const createResult = await this.productAppService.getAllProducts();
    
            console.log('result', createResult);
        }
    }
}