import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from './infrastructure/inversify.config';
import { UserController } from './Login/controller/app.js';
import Middleware from './middleware/ExecptionMiddleware';
import PasswordService from './infrastructure/PasswordService';
import { RabbitMQService } from './infrastructure/RabbitMQService'; 
import { ProductController } from '../src/Product/controller/app';
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

const rabbitmqService = new RabbitMQService('amqp://localhost', 'Queue'); 


app.post('/api/queu1', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData); 

  rabbitmqService.sendMessage(messageText, (error: any) => {
    if (error) {
      console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
      res.status(500).send('RabbitMQ hatası');
    } else {
      res.send('İstek alındı ve RabbitMQ\'ya iletiliyor.');
    }
  });
});

app.post('/api/queu2', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData); 

  rabbitmqService.sendMessage(messageText, (error: any) => {
    if (error) {
      console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
      res.status(500).send('RabbitMQ hatası');
    } else {
      res.send('İstek alındı ve RabbitMQ\'ya iletiliyor.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
