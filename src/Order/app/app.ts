import express from 'express';
import { inject, injectable } from 'inversify';
import { OrderApplicationService } from '../appservices/OrderApplicationService';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
interface IMessageData {
    action: string;
    orderId: ObjectId;
    items: { productname: string; quantity: number; ıd: ObjectId }[];
    totalPrice: number;
    Invoicedetail: any[];
    deliveryAddress: any[];
    [key: string]: any;
}
interface IOrderFunctions {
    createOrder: (orderAppService: OrderApplicationService, messageData: IMessageData) => Promise<void>;
    updateOrder: (orderAppService: OrderApplicationService, messageData: IMessageData) => Promise<void>;
    deleteOrder: (orderAppService: OrderApplicationService, messageData: IMessageData) => Promise<void>;
    getOrder: (orderAppService: OrderApplicationService, messageData: IMessageData) => Promise<void>;
    getAllOrders: (orderAppService: OrderApplicationService, messageData: IMessageData) => Promise<void>;
}


@injectable()
export class OrderApp {
    private readonly orderAppService: OrderApplicationService;


    constructor(
        @inject(OrderApplicationService) orderAppService: OrderApplicationService,
        @inject(RabbitMQHandler) private handlerQueue: RabbitMQHandler

    ) {
        this.orderAppService = orderAppService;

        this.handlerQueue = handlerQueue;

    }

    public async handleMessage() {
        this.handlerQueue.listenForMessages('OrderQueue', (response: any) => {
            this.handleMessageAction(response.content.toString());
        });


    }
    private async handleMessageAction(message: string) {
        type ActionKeys = keyof IOrderFunctions;
        const messageData: IMessageData = JSON.parse(message);
        const action: ActionKeys = messageData.action as ActionKeys;

        const func = this.functions[action];

        if (!func) {
            const responseMessage = {
                result: 'undefined method',
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.handlerQueue.sendRabbitMQ('ApiGate', responseMessageText);
            return;
        }

        return await func(this.orderAppService, messageData);
    }


    private functions: IOrderFunctions = {
        createOrder: async (orderAppService, messageData) => {
            const response = await orderAppService.createOrder(
                messageData.userId,
                messageData.items,
                messageData.price,
                messageData.Invoicedetail,
                messageData.deliveryAddress
            );
            const responseMessage = {
                response: response,
            };
            this.handlerQueue.sendRabbitMQ('AggregatorQueue', messageData.response);

        },
        updateOrder: async (orderAppService, messageData) => {
            const response = await orderAppService.updateOrder(
                messageData.id,
                messageData.orderId,
                messageData.items,
                messageData.price,
                messageData.Invoicedetail,
                messageData.deliveryAddress
            );
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);

        },
        deleteOrder: async (orderAppService, messageData) => {
            const response = await orderAppService.deleteOrder(messageData.id);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);

        },
        getOrder: async (orderAppService, messageData) => {
            const response = await orderAppService.getOrderById(messageData.id);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
        },
        getAllOrders: async (orderAppService, messageData) => {
            const response = await orderAppService.getAllOrders();
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
        },

    };

}