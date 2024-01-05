import express, { Request, Response, Router } from 'express';
import { UserService } from '../domain/Users/UserService';
import { inject, injectable } from 'inversify';

import 'reflect-metadata';
import { UserApplicationService } from '../appservices/UserApplicationService'; 
import jwt from 'jsonwebtoken';
import amqplib, { Channel, Connection } from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import  { SecurityExtension } from '../../infrastructure/SecurityExtension';

import { RabbitMQProvider } from '../../infrastructure/RabbitMQProvider';
import { RequestResponseMap } from '../../infrastructure/RequestResponseMap';
interface ApiResponse<T> {
    response: T;
    token: string;
}

@injectable()
export class AuthApp{
    private readonly userAppService: UserApplicationService;


    constructor(
        @inject(UserService) private userService: UserService,
        @inject(SecurityExtension) securityExtension: SecurityExtension,
        @inject('UserRabbitMQProviderQueue') private UserrabbitMQProvider: RabbitMQProvider,
        @inject(UserApplicationService) userAppService: UserApplicationService ,
        @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
        @inject(RequestResponseMap) private requestResponseMap: RequestResponseMap


    ) {
        this.requestResponseMap=requestResponseMap;
        this.aggregatorRabbitMQProviderQueue=aggregatorRabbitMQProviderQueue;
        this.userAppService = userAppService; 
        this.UserrabbitMQProvider.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
        
    }


    public async handleMessage(message: string) {

        const messageData = JSON.parse(message);
    
        const func = this.functions[messageData.action];

        if(!func) {
            throw new Error("undefined method");            
        }
        return await func(this.userAppService, messageData, this.aggregatorRabbitMQProviderQueue);
    }
 
        

    
    private  functions = {
        async login(userAppService: UserApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const response = await userAppService.loginUser(messageData.username, messageData.password,messageData.role);
            const responseMessage = {
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } 
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                
            });

        },
        async register(userAppService: UserApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const registrationResponse = await userAppService.registerUser(messageData.username, messageData.password,messageData.role);
            console.log('Register response:', registrationResponse);

            const responseMessage = {
                response: registrationResponse,
            };
            const responseMessageText = JSON.stringify(responseMessage);
            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
     
        },
      };
}
