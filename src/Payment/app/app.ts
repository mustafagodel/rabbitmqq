// ShoppingApp.ts

import { inject, injectable } from 'inversify';
import { PaymentApplicationService } from '../appservices/PaymentApplicationService';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
interface IMessageData {
    action: string;

    amount: number;

}
@injectable()
export class PaymentApp {

    constructor(
        @inject(PaymentApplicationService) private paymentApplicationService: PaymentApplicationService,
        @inject(RabbitMQHandler) private handlerQueue: RabbitMQHandler
    ) {

        this.paymentApplicationService = paymentApplicationService;
        this.handlerQueue = handlerQueue;



    }
    public async handleMessage() {
        this.handlerQueue.listenForMessages('PaymentQueue', (response: any) => {
            this.handleMessageAction(response.content.toString());
        });
    }

    private async handleMessageAction(message: string) {
        const messageData: IMessageData = JSON.parse(message);

        const func = this.functions[messageData.action as keyof typeof this.functions];

        if (!func) {
            const responseMessage = {
                result: 'undefined method',
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
            return;
        }

        await func();
    }



    private functions = {
        processPayment: async () => {
            const randomNumber = Math.random()*5;


            if (randomNumber === 0) {
                const responseMessage = {
                    error: "insufficient_balance"
                };
                const responseMessageText = JSON.stringify(responseMessage);

                this.handlerQueue.sendRabbitMQ('ResponseQueue', responseMessageText);
            } else {




                const responseMessage = {
                    result: "succes"
                };
                const responseMessageText = JSON.stringify(responseMessage);

                this.handlerQueue.sendRabbitMQ('ResponseQueue', responseMessageText);

            }
        }
    }
}








