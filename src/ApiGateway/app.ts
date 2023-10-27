import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from '../infrastructure/inversify.config';
import { UserController } from '../Auth/app/app.js';
import Middleware from '../middleware/ExecptionMiddleware';
import PasswordService from '../infrastructure/PasswordService';
import { RabbitMQService } from '../infrastructure/RabbitMQService'; 
import { ProductController } from '../Product/app/app';
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);
app.use(Middleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
container.get<UserController>(UserController);
container.get<ProductController>(ProductController);


const rabbitmqService = container.get<RabbitMQService>('RabbitMQServiceQueue1');
const rabbitmqService2 = container.get<RabbitMQService>('RabbitMQServiceQueue2');




app.post('/api/queu1', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData); 

  rabbitmqService.sendMessage(messageText, (error: any) => {
    if (error) {
      console.log('RabbitMQ bağlantı veya gönderme hatası:', error);
    } else {
      console.log('İstek alındı ve RabbitMQ\'ya iletiliyor.');
    }
  });

  rabbitmqService.onMessageReceived((message) => {
    const messageData = JSON.parse(message);
    
    if (messageData.action === 'login_response') {
      res.status(500).json(messageData);
    }else  if (messageData.action === 'register_response') {
      res.status(500).json(messageData);
    }
  });
});


app.post('/api/queu2', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData); 

  rabbitmqService2.sendMessage(messageText, (error: any) => {
    if (error) {
      console.log('RabbitMQ bağlantı veya gönderme hatası:', error);
    } else {
      console.log('İstek alındı ve RabbitMQ\'ya iletiliyor.');
    }
  });
  rabbitmqService2.onMessageReceived((message) => {
    const messageData = JSON.parse(message);
    if (messageData.action === 'create_response') {
      res.status(500).json(messageData);
    }else  if (messageData.action === 'get_response') {
      res.status(500).json(messageData);
    }
    else  if (messageData.action === 'delete_response') {
      res.status(500).json(messageData);
    }
    else  if (messageData.action === 'getAll_response') {
      res.status(500).json(messageData);
    }
    else  if (messageData.action === 'update_response') {
      res.status(500).json(messageData);
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
