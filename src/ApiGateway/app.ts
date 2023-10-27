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
      console.log('RabbitMQ is connected or Sending error:', error);
    } else {
      console.log('The Request was received and Sending RabbitMQ');
    }
  });

  rabbitmqService.onMessageReceived((message) => {
    const messageData = JSON.parse(message);
    if (['login_response', 'register_response'].includes(messageData.action)) {
      res.status(500).json(messageData);
    } else{
      res.status(400).json({ error: 'Invalid transaction.' });
    }
  });
});


app.post('/api/queu2', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData); 

  rabbitmqService2.sendMessage(messageText, (error: any) => {
    if (error) {
      console.log('RabbitMQ is connected or Sending error:', error);
    } else {
      console.log('The Request was received and Sent RabbitMQ ');
    }
  });
  rabbitmqService2.onMessageReceived((message) => {
    const messageData = JSON.parse(message);
    if (['create_response', 'get_response', 'delete_response', 'getAll_response', 'update_response'].includes(messageData.action)) {
      res.status(500).json(messageData);
    }else{
      res.status(400).json({ error: 'Invalid transaction.' });

    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
