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

@injectable()
export class UserController {
    private readonly userAppService: UserApplicationService;


    constructor(
        @inject(UserService) private userService: UserService,
        @inject(PasswordService) passwordService: PasswordService,
        @inject('RabbitMQServiceQueue1') private rabbitmqService1: RabbitMQService,
        @inject(UserApplicationService) userAppService: UserApplicationService 
    ) {
        this.userAppService = userAppService; 

        this.rabbitmqService1.onMessageReceived((message: string) => {
            this.handleMessage1(message);
        });
    }


    public async handleMessage1(message: string) {
        const messageData = JSON.parse(message);
    
        if (messageData.action === 'login') {
            const response = await this.userAppService.loginUser(messageData.username, messageData.password);
            const responseMessage = {
                action: 'login_response',
                response: response,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        } else if (messageData.action === 'register') {
            const registrationResponse = await this.userAppService.registerUser(messageData.username, messageData.password);
            console.log('Register response:', registrationResponse);

            const responseMessage = {
                action: 'register_response',
                response: registrationResponse,
            };
            const responseMessageText = JSON.stringify(responseMessage);
    
     
            this.rabbitmqService1.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }
    }
    
}
