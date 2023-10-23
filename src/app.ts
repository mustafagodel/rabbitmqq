import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from './infrastructure/inversify.config';
import { UserController } from './Login/controller/UserController';
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

const userController = container.get<UserController>(UserController);

const rabbitmqService = new RabbitMQService('amqp://localhost', 'Queue'); // RabbitMQ servisi

app.post('/api', (req, res) => {
  const requestData = req.body;

 
  rabbitmqService.sendMessage(requestData, (error: any) => {
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
