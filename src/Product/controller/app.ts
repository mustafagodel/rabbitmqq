import { Request, Response, Router } from 'express';
import { ProductService } from '../../Product/domain/Product/ProductService';
import { inject, injectable } from 'inversify';
import express from 'express';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ProductApplicationService } from '../appservices/ProductApplicationService';
import { RabbitMQService } from '../../infrastructure/RabbitMQService';
@injectable()
export class ProductController {
    private readonly router: Router;
    private readonly productAppService: ProductApplicationService;
    rabbitmqService1: RabbitMQService;

    constructor(@inject(ProductService) private productService: ProductService) {
        this.router = express.Router();
        this.productAppService = new ProductApplicationService(productService);
        this.rabbitmqService1 = new RabbitMQService('amqp://localhost', 'Queue1');
        this.rabbitmqService1.onMessageReceived((message: string) => {
            this.handleMessage1(message);
        });
    }
    public async handleMessage1(message: string) {
        const messageData = JSON.parse(message);
        if (messageData.action === 'create') {
            const createResult = await this.productAppService.createProduct(
                messageData.name,
                messageData.price,
                messageData.stock
            );
    
            console.log('result', createResult);
        }
    }


  
}

export { ProductApplicationService };
