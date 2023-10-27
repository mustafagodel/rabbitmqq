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

app.post('/api', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData);

  
  const actionToServiceMap: Record<string, RabbitMQService> = {
    'login': rabbitmqService,
    'register': rabbitmqService,
    'create': rabbitmqService2,
    'get': rabbitmqService2,
    'delete': rabbitmqService2,
    'getAll': rabbitmqService2,
    'update': rabbitmqService2,
  };
  const rabbitmqServiceToUse = actionToServiceMap[requestData.action];
  if (!rabbitmqServiceToUse) {
    return res.status(400).json({ error: 'Invalid action.' });
  }

  rabbitmqServiceToUse.sendMessage(messageText, (error) => {
    if (error) {
      console.log('RabbitMQ is connected or Sending error:', error);
      return res.status(500).json(error);
    }
    console.log('The Request was received and Sent RabbitMQ');
    const responseActionsMap: Record<string, string[]> = {
      'login': ['login_response'],
      'register': ['register_response'],
      'create': ['create_response'],
      'get': ['get_response'],
      'delete': ['delete_response'],
      'getAll': ['getAll_response'],
      'update': ['update_response'],
    };

      rabbitmqServiceToUse.onMessageReceived((message) => {
        const messageData = JSON.parse(message);
        const validActions = responseActionsMap[requestData.action] || [];
  
        if (validActions.includes(messageData.action)) {
          res.status(200).json(messageData);
        } else {
          res.status(400).json({ error: 'Invalid transaction.' });
        }
      });
    });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
