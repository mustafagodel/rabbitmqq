import { inject, injectable } from 'inversify';
import { ShoppingBasketApplicationService } from '../../ShoppingBasket/appservices/ShoppingBasketApplicationService';
import { RabbitMQProvider } from '../../infrastructure/RabbitMQProvider';
import { ShoppingBasket } from '../domain/ShoppingBasket';

@injectable()
export class ShoppingApp {

    constructor(
        @inject(ShoppingBasketApplicationService) private shoppingBasketApplicationService: ShoppingBasketApplicationService,
        @inject('ShoppingBasketRabbitMQProviderQueue') private shoppingBasketRabbitMQProviderQueue: RabbitMQProvider,
        @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
    ) {

 this.shoppingBasketApplicationService = shoppingBasketApplicationService;
        this.shoppingBasketRabbitMQProviderQueue = shoppingBasketRabbitMQProviderQueue;
        this.shoppingBasketRabbitMQProviderQueue.onMessageReceived((message:string)=>{
            this.handleMessage(message);
        });
        

    }
    public async handleMessage(message: string) {
        const messageData = JSON.parse(message);

        const func = this.functions[messageData.action];

        if(!func) {
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

        return await func(this.shoppingBasketApplicationService, messageData, this.aggregatorRabbitMQProviderQueue);
    }
    public functions = {
        async addShoppingBasket(shoppingBasketApplicationService: ShoppingBasketApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
                const createResult =await shoppingBasketApplicationService.createShoppingBasket(messageData.userId,messageData.items);
     
              
                const responseMessage = {
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
            
        }
            
        }
};

