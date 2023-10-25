import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from './infrastructure/inversify.config';
import { UserController } from './Login/controller/app.js';
import Middleware from './middleware/ExecptionMiddleware';
import PasswordService from './infrastructure/PasswordService';
import { RabbitMQService } from './infrastructure/RabbitMQService'; // Yeni ekledik

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);

app.use(Middleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('dist'));
const userController = container.get<UserController>(UserController);

const rabbitmqService = new RabbitMQService('amqp://localhost', 'Queue'); // RabbitMQ servisi
rabbitmqService.onMessageReceived((message: string) => {
  userController.handleMessage1(message);
});
app.post('/other', (req, res) => {
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
