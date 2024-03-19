

import { inject, injectable } from 'inversify';
import { ShoppingBasketApplicationService } from '../appservices/ShoppingBasketApplicationService';

import { ObjectId } from 'mongodb';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
interface IMessageData {
    action: string;
    userId: ObjectId;
    items: any[];
    price: number;
    invoiceDetails: any[];
    deliveryAddress: any[];
}

@injectable()
export class ShoppingApp {

    constructor(
        @inject(ShoppingBasketApplicationService) private shoppingBasketApplicationService: ShoppingBasketApplicationService,
        @inject(RabbitMQHandler) private handlerQueue: RabbitMQHandler
    ) {


        this.shoppingBasketApplicationService = shoppingBasketApplicationService;

        this.handlerQueue = handlerQueue;
    }
    public async handleMessage() {
        this.handlerQueue.listenForMessages('ShoppingQueue', (response: any) => {
            this.handleMessageAction(response.content.toString());
        });
    }

    private async handleMessageAction(message: string) {
        const messageData: IMessageData = JSON.parse(message);
        const action = messageData.action as keyof typeof this.functions;

        const func = this.functions[action];

        if (!func) {
            const responseMessage = {
                result: 'undefined method',
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
            return;
        }

        return await func(this.shoppingBasketApplicationService, messageData);
    }

    private functions = {
        addShoppingBasket: async (shoppingBasketApplicationService: ShoppingBasketApplicationService, messageData: IMessageData) => {
            const createResult = await shoppingBasketApplicationService.createShoppingBasket(messageData.userId, messageData.items, messageData.price, messageData.invoiceDetails, messageData.deliveryAddress);

            const responseMessage = {
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
        },

        completeShoppingBasket: async (shoppingBasketApplicationService: ShoppingBasketApplicationService, messageData: IMessageData) => {
            const createResult = await shoppingBasketApplicationService.completeShoppingBasket(messageData.userId, messageData.items, messageData.price, messageData.invoiceDetails, messageData.deliveryAddress);

            const responseMessage = {
                response: createResult,
            };
            const responseMessagetext = JSON.stringify(responseMessage);

        
            if (createResult.message == 'Shopping Basket Successfully Complete ') {

                const stockMessage = {
                    action: 'createOrder',
                    userId: messageData.userId,
                    items: messageData.items,
                    price: messageData.price,
                    InvoiceDetail: messageData.invoiceDetails,
                    deliveryAddress: messageData.deliveryAddress,
                    completeShoppingBasketid: "completeShoppingBasketid",
                    response: responseMessagetext
                };

                const stockMessageText = JSON.stringify(stockMessage);
                this.handlerQueue.sendRabbitMQ('OrderQueue', stockMessageText);

            }




        }
    };
}
