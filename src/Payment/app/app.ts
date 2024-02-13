// ShoppingApp.ts

import { inject, injectable } from 'inversify';
import { ShoppingBasketApplicationService } from '../../ShoppingBasket/appservices/ShoppingBasketApplicationService';
import { RabbitMQProvider } from '../../infrastructure/RabbitMQProvider';
import { PaymentApplicationService } from '../appservices/PaymentApplicationService';

@injectable()
export class PaymentApp {

    constructor(
        @inject(PaymentApplicationService) private paymentApplicationService: PaymentApplicationService,
        @inject('PaymentRabbitMQProviderQueue') private PaymentRabbitMQProviderQueue: RabbitMQProvider,
        @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
    ) {

        this.paymentApplicationService = paymentApplicationService;
        this.PaymentRabbitMQProviderQueue = PaymentRabbitMQProviderQueue;
        this.PaymentRabbitMQProviderQueue.onMessageReceived((message: string) => {
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

         await func(this.paymentApplicationService, messageData, this.aggregatorRabbitMQProviderQueue);
    }


    public functions = {
      async processPayment(paymentApplicationService: PaymentApplicationService, message: string, rabbitmqService: RabbitMQProvider) {
        const responseMessage = {
            result: "succes"
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
    }
   
  

    }

    
  

