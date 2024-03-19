import { Request, Response } from 'express';
import { ReturnService } from '../domain/Return/ReturnService';
import { inject, injectable } from 'inversify';
import express from 'express';
import { ReturnApplicationService } from '../appservices/ReturnApplicationService';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
interface IMessageData {
    action: string;
    returnReason: string;
    returnItems: any[];
}
@injectable()
export class ReturnApp {

    private readonly returnAppService: ReturnApplicationService;

    constructor(
        @inject(ReturnApplicationService) private returnApplicationService: ReturnApplicationService,
        @inject(RabbitMQHandler) private handlerQueue: RabbitMQHandler

    ) {

        this.returnAppService = returnApplicationService;
        this.handlerQueue=handlerQueue;
    
    }
    public async handleMessage() {
    
        this.handlerQueue.listenForMessages('ReturnQueue', (response: any) => {
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
            this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);
            return;
        }

        return await func(this.returnAppService, messageData);
    }
    private functions = {
         createReturn:async (returnAppService: ReturnApplicationService, messageData: IMessageData) =>{
            const createResult = await returnAppService.createReturn(
                messageData.returnReason,
                messageData.returnItems
            );


            const responseMessage = {
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);

        },

    }

};








