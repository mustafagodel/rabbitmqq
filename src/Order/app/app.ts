import express from 'express';
import { OrderService } from '../domain/Product/OrderService';
import { inject, injectable } from 'inversify';
import { OrderApplicationService } from '../appservices/OrderApplicationService';
import jwt from 'jsonwebtoken';
import { RabbitMQService } from '../../infrastructure/RabbitMQService';

@injectable()
export class OrderController {
    private readonly orderAppService: OrderApplicationService;

    constructor(
        @inject(OrderService) private orderService: OrderService,
        @inject('OrderRabbitMQServiceQueue') private OrderrabbitmqService: RabbitMQService,
        @inject(OrderApplicationService) orderAppService: OrderApplicationService
    ) {
        this.orderAppService = orderAppService;

        this.OrderrabbitmqService.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
    }

    public async handleMessage(message: string) {
        const messageData = JSON.parse(message);

        const func = this.functions[messageData.action];

        if (!func) {
            throw new Error('undefined method');
        }

        return await func(this.orderAppService, messageData, this.OrderrabbitmqService);
    }

    private functions = {
        async create(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
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
                } else {
                    console.log('Response message has been sent to RabbitMQ.');
                }
            });
        },
        async update(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
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
                } else {
                    console.log('Response message has been sent to RabbitMQ.');
                }
            });
        },
        
        async delete(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const response = await orderAppService.deleteOrder(messageData.id);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
        
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('Response message has been sent to RabbitMQ.');
                }
            });
        },
        
        async getOrder(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const response = await orderAppService.getOrderById(messageData.id);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
        
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('Response message has been sent to RabbitMQ.');
                }
            });
        },
        
        async getAllOrders(orderAppService: OrderApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const response = await orderAppService.getAllOrders();
            const responseMessage = {
                response: response,
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
    };
}
