import express, { Request, Response, Router } from 'express';
import { UserService } from '../domain/Users/UserService';
import { inject, injectable } from 'inversify';
import Outmiddleware from '../middleware/AuthMiddleware';
import 'reflect-metadata';
import { UserApplicationService } from '../appservices/UserApplicationService'; 
import jwt from 'jsonwebtoken';
import amqplib, { Channel, Connection } from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import PasswordService from '../infrastructure/PasswordService';

@injectable()
export class UserController {
    private readonly userAppService: UserApplicationService; 
    passwordService: any;

    constructor(@inject(UserService) private userService: UserService,@inject(PasswordService) passwordService: PasswordService) {
        this.userAppService = new UserApplicationService(userService);
        this.setupRabbitMQ();
    }

    private setupRabbitMQ() {
        const rabbitmqServer = 'amqp://localhost'; 
        const queueName = 'Queue'; 

        amqp.connect(rabbitmqServer, (error, connection) => {
            if (error) {
                console.error('RabbitMQ bağlantı hatası:', error);
                return;
            }

            connection.createChannel((error, channel) => {
                if (error) {
                    console.error('RabbitMQ kanalı oluşturma hatası:', error);
                    connection.close();
                    return;
                }

                channel.assertQueue(queueName, { durable: false });

                console.log(`Listening for messages in ${queueName}...`);

                channel.consume(queueName, (message) => {
                    if (message) {
                        const messageContent = message.content.toString();
                        console.log(`Received message: ${messageContent}`);

                      
                        this.handleMessage(messageContent, channel, message);
                    }
                });
            });
        });
    }

    private async handleMessage(messageContent: string, channel: amqp.Channel, amqpMessage: amqp.Message) {

        const message = JSON.parse(messageContent);

        if (message.action === 'login') {
  
            const response = await this.userAppService.loginUser(message.username,message.password);

        
            console.log('Login response:', response);
        }else if(message.action === 'register'){
            const loginuser = await this.userAppService.registerUser(message.username, message.password);
            console.log('register response:', loginuser);
        }
     
        channel.ack(amqpMessage);
    }
}

export default UserController;
