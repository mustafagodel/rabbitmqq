import express, { Request, Response, Router } from 'express';
import { UserService } from '../domain/Users/UserService';
import { inject, injectable } from 'inversify';

import 'reflect-metadata';
import { UserApplicationService } from '../appservices/UserApplicationService'; 
import jwt from 'jsonwebtoken';
import amqplib, { Channel, Connection } from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import  { PasswordService } from '../../infrastructure/PasswordService';

import { RabbitMQService } from '../../infrastructure/RabbitMQService';
interface ApiResponse<T> {
    response: T;
    token: string;
}

@injectable()
export class UserController {
    private readonly userAppService: UserApplicationService;


    constructor(
        @inject(UserService) private userService: UserService,
        @inject(PasswordService) passwordService: PasswordService,
        @inject('UserRabbitMQServiceQueue') private UserrabbitmqService: RabbitMQService,
        @inject(UserApplicationService) userAppService: UserApplicationService 
    ) {
        this.userAppService = userAppService; 

        this.UserrabbitmqService.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
        
    }


    public async handleMessage(message: string,) {
        const messageData = JSON.parse(message);

        const func = this.functions[messageData.action];

        if(!func) {
            throw new Error("undefined method");            
        }
        return await func(this.userAppService, messageData, this.UserrabbitmqService);
    }
 
        

    
    private  functions = {
        async login(userAppService: UserApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const response = await userAppService.loginUser(messageData.username, messageData.password);
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
        async register(userAppService: UserApplicationService, messageData: any, rabbitmqService: RabbitMQService) {
            const registrationResponse = await userAppService.registerUser(messageData.username, messageData.password);
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
