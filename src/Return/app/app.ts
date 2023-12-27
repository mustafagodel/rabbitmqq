import { Request, Response } from 'express';
import { ReturnService } from '../domain/Return/ReturnService';
import { inject, injectable } from 'inversify';
import express from 'express';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ReturnApplicationService } from '../appservices/ReturnApplicationService';
import { RabbitMQProvider } from '../../infrastructure/RabbitMQProvider';

@injectable()
export class ReturnApp {

    private readonly returnAppService: ReturnApplicationService;

    constructor(
        @inject(ReturnService) private returnService: ReturnService,
        @inject(ReturnApplicationService) private returnApplicationService: ReturnApplicationService,
        @inject('ReturnRabbitMQProviderQueue') private returnRabbitMQProviderQueue: RabbitMQProvider,
        @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,

    ) {
        this.returnRabbitMQProviderQueue = returnRabbitMQProviderQueue;
        this.returnAppService = returnApplicationService;
        this.returnRabbitMQProviderQueue.onMessageReceived((message:string)=>{
            this.handleMessage(message);
        })
    }

    public async handleMessage(message: string) {
        const messageData = JSON.parse(message);

        const func = this.functions[messageData.action];

        if(!func) {
            throw new Error("undefined method");            
        }

        return await func(this.returnAppService, messageData, this.aggregatorRabbitMQProviderQueue);
    }
    public functions = {
        async createReturn(returnAppService: ReturnApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const createResult = await returnAppService.createReturn(
                messageData.returnReason,
                messageData.isDefective,
                messageData.returnItems
            );
    
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
        },
    };

        async processReturnAndSendResponse(
            messageData: any,
        ){
            const checkResult = checkReturn(messageData.returnReason, messageData.isDefective);
    
            const processResult = processReturn(messageData.returnReason, checkResult);
    
            const statusInfo = getReturnStatusInfo(checkResult);
    
            const responseMessage = {
                response: {
                    checkResult,
                    processResult,
                    statusInfo,
                },
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
            this.aggregatorRabbitMQProviderQueue.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('The response message has been sent to RabbitMQ.');
                }
            });
        }
   
    
    }
    

    
    function checkReturn(returnReason: string, isDefective: boolean): { isValid: boolean; checkMessage: string } | null {
        if (returnReason='ayakkabı küçük geldi' || returnReason=='ayakkabı büyük geldi') {
            const checkResult = {
                isValid: isDefective,
                checkMessage: isDefective ? "Return is valid." : "Return is not valid. Invalid return reason or defective item."
            };
            return checkResult;
        } else {
            return null;
        }
    }
    

    function processReturn(returnReason: string, checkResult: { isValid: any; checkMessage?: string }|null) {
        const processResult = {
            success: checkResult?.isValid,
            processMessage: checkResult?.isValid ? 'Return processing started.' : 'Return processing rejected.',
        };

        return processResult;
    }

    function getReturnStatusInfo(checkResult: { isValid: any; checkMessage?: string }|null) {
        const statusInfo = {
            statusDetails: checkResult?.isValid ? 'Return is valid' : 'Return is not valid',
        };

        return statusInfo;
    }

  




