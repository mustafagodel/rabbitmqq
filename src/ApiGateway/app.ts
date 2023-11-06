import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from '../infrastructure/inversify.config';
import { UserController } from '../Auth/app/app.js';
import { OrderController } from '../Order/app/app';
import Middleware from '../middleware/ExecptionMiddleware';
import  AuthMiddleware  from '../middleware/AuthMiddleware';
import PasswordService from '../infrastructure/PasswordService';
import { RabbitMQService } from '../infrastructure/RabbitMQService'; 
import { ProductController } from '../Product/app/app';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';  
require('dotenv').config();
import jwt from 'jsonwebtoken';
const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Middleware);
app.use(AuthMiddleware);
container.get<UserController>(UserController);
container.get<ProductController>(ProductController);
container.get<OrderController>(OrderController);
const requestResponseMap = container.get<RequestResponseMap>(RequestResponseMap);
const secretKey = process.env.SECRET_KEY as string; 



const sendResponseToClient = (res, rabbitmqServiceToUse, messageText) => {
  rabbitmqServiceToUse.sendMessage(messageText, (error) => {
    if (error) {
      console.log('RabbitMQ is connected or Sending error:', error);
      return res.status(500).json(error);
    }
    console.log('The Request was received and Sent to RabbitMQ');

    rabbitmqServiceToUse.onMessageReceived((message) => {
      const messageData = JSON.parse(message);
      res.status(200).json(messageData);
    });
  })
};

app.post('/api',(req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData);

  const rabbitmqServiceToUse = requestResponseMap.getRequestService(requestData.action);
  if (!rabbitmqServiceToUse) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (!requestResponseMap.requiresToken(requestData.action)) {
    sendResponseToClient(res, rabbitmqServiceToUse, messageText);
  } else {
    const userToken = req.headers.authorization;
    if (userToken && typeof userToken === 'string') {
      jwt.verify(userToken, secretKey, (err, decoded) => {
      
        const user = decoded;

        sendResponseToClient(res, rabbitmqServiceToUse, messageText);
  
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


