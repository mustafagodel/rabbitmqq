import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from '../infrastructure/inversify.config';
import { AuthApp } from '../Auth/app/app.js';
import { OrderApp } from '../Order/app/app';
import Middleware from '../middleware/ExecptionMiddleware';
import  AuthMiddleware  from '../middleware/AuthMiddleware';
import PasswordService from '../infrastructure/PasswordService';
import { RabbitMQService } from '../infrastructure/RabbitMQService'; 
import { ProductApp } from '../Product/app/app';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';  

require('dotenv').config();
import jwt from 'jsonwebtoken';
import { Aggregator } from '../infrastructure/Aggregator';
const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Middleware);
app.use(AuthMiddleware);
container.get<AuthApp>(AuthApp);
const product =container.get<ProductApp>(ProductApp);
container.get<OrderApp>(OrderApp);
const requestResponseMap = container.get<RequestResponseMap>(RequestResponseMap);
const secretKey = process.env.SECRET_KEY as string; 
const aggregator =container.get<Aggregator>(Aggregator);




app.post('/api/deneme', (req, res) => {
  const requestData = req.body;
  const rabbitmqServiceToUse = requestResponseMap.getRequestService(requestData.action);

  if (!rabbitmqServiceToUse) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (!requestResponseMap.requiresToken(requestData.action)) {
    sendResponseToClient(res,rabbitmqServiceToUse,requestData);
    
  } else {
    const userToken = req.headers.authorization;
    if (userToken && typeof userToken === 'string') {
      sendResponseToClient(res,rabbitmqServiceToUse,requestData);

    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
});
const sendResponseToClient = (res, rabbitmqServiceToUse, requestData) => {
  const responseMessageText = JSON.stringify(requestData);

  rabbitmqServiceToUse.sendMessage(responseMessageText, (error) => {
    if (error) {
      console.log('RabbitMQ is connected or Sending error:', error);
      return res.status(500).json(error);
    }
    console.log('The Request was received and Sent to RabbitMQ');
   
  });
  rabbitmqServiceToUse.onMessageReceived((message) => {
    const responseData =  aggregator.handleMessageAction(message);
    const responseMessageText = JSON.stringify(message);
    console.log('Received message from RabbitMQ:', responseMessageText);

    res.status(200).json(responseMessageText);
  });
};


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});