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
    private readonly rabbitmqService: RabbitMQService;

    constructor(@inject(UserService) private userService: UserService, @inject(PasswordService) passwordService: PasswordService) {
        this.userAppService = new UserApplicationService(userService);
        this.rabbitmqService = new RabbitMQService('amqp://localhost', 'Queue');
        this.setupRabbitMQ(); 
    }


    private setupRabbitMQ() {
        this.rabbitmqService.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
    }

    private async handleMessage(message: string) {
        const messageData = JSON.parse(message);

        if (messageData.action === 'login') {
            const response = await this.userAppService.loginUser(messageData.username, messageData.password);
            console.log('Login response:', response);
        } else if (messageData.action === 'register') {
            const registrationResponse = await this.userAppService.registerUser(messageData.username, messageData.password);
            console.log('Register response:', registrationResponse);
        }
    }
}
