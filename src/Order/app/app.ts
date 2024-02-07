import express from 'express';
import { OrderService } from '../domain/Product/OrderService';
import { inject, injectable } from 'inversify';
import { OrderApplicationService } from '../appservices/OrderApplicationService';
import jwt from 'jsonwebtoken';
import { RabbitMQProvider } from '../../infrastructure/RabbitMQProvider';

@injectable()
export class OrderApp{
    private readonly orderAppService: OrderApplicationService;


    constructor(
        @inject(OrderService) private orderService: OrderService,
        @inject('OrderRabbitMQProviderQueue') public OrderrabbitMQProvider: RabbitMQProvider,
        @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
        @inject(OrderApplicationService) orderAppService: OrderApplicationService
    ) {
        this.orderAppService = orderAppService;
   
        this.OrderrabbitMQProvider.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });

    }

    public async handleMessage(message: string) { 
        const messageData = JSON.parse(message);

        const func = this.functions[messageData.action];

        if (!func) {
            const responseMessage = {
                result: 'undefined method',
            };
            const responseMessageText = JSON.stringify(responseMessage);
           this.aggregatorRabbitMQProviderQueue.sendMessage(responseMessageText, (error: any) => {
            if (error) {
                console.error('RabbitMQ connection or sending error:', error);
            } 
                console.log('Response message has been sent to RabbitMQ.');
          
        });
        return;
        }
     
        return await func(this.orderAppService, messageData, this.aggregatorRabbitMQProviderQueue);
    }


    public functions = {
        async createOrderr(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {

            const response = await orderAppService.createOrder(
                messageData.orderId,
                messageData.items,
                messageData.price
            );
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } 
                    console.log('Response message has been sent to RabbitMQ.');
              
            });
       
        },
        async updateOrder(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const response = await orderAppService.updateOrder(
                messageData.id,
                messageData.orderId,
                messageData.items,
                messageData.price
            );
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
        
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } 
                    console.log('Response message has been sent to RabbitMQ.');
                
            });
        },
        
        async deleteOrder(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const response = await orderAppService.deleteOrder(messageData.id);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
        
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } 
                    console.log('Response message has been sent to RabbitMQ.');
                
            });
        },
        
        async getOrder(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const response = await orderAppService.getOrderById(messageData.id);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
        
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } 
                    console.log('Response message has been sent to RabbitMQ.');
                
            });
        },
        
        async getAllOrders(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const response = await orderAppService.getAllOrders();
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
        
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } 
                    console.log('Response message has been sent to RabbitMQ.');
                
            });
        }
    };
}
