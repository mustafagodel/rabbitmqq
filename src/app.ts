import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from './infrastructure/inversify.config';
import { UserController } from './Auth/controller/app';
import Middleware from './middleware/ExecptionMiddleware';
import PasswordService from './infrastructure/PasswordService';
import { RabbitMQService } from './infrastructure/RabbitMQService'; 

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);

app.use(Middleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userController = container.get<UserController>(UserController);
const rabbitmqServiceQueue = new RabbitMQService('amqp://localhost','Queue' );
const rabbitmqServiceQueue1 = new RabbitMQService('amqp://localhost','Queue1' );
const rabbitmqServiceQueue2 = new RabbitMQService('amqp://localhost','Queue2' );

app.post('/api', (req, res) => {
  const requestData = req.body;
  rabbitmqServiceQueue.sendMessage(requestData, (error) => {
    if (error) {
      console.error('RabbitMQ bağlantı veya gönderme hatası (Queue):', error);
      res.status(500).send('RabbitMQ hatası (Queue)');
    } else {
      res.send('İstek alındı ve RabbitMQ\'ya (Queue) iletiliyor.');
    }
  });
});

app.post('/api/queu1', (req, res) => {
  const requestData1 = req.body;
  rabbitmqServiceQueue1.sendMessage(requestData1, (error) => {
    if (error) {
      console.error('RabbitMQ bağlantı veya gönderme hatası (Queue1):', error);
      res.status(500).send('RabbitMQ hatası (Queue1)');
    } else {
      res.send('İstek alındı ve RabbitMQ\'ya (Queue1) iletiliyor.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

