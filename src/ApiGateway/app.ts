import express from 'express';
import 'reflect-metadata';
import bodyParser, { json } from 'body-parser';
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
import { Response } from 'express-serve-static-core';
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
container.get<Aggregator>(Aggregator);




app.post('/api/deneme', (req, res) => {
  const requestData = req.body;
  const rabbitmqServiceToUse = requestResponseMap.getRequestService(requestData.action);
  

  if (!rabbitmqServiceToUse) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (!requestResponseMap.requiresToken(requestData.handler)) {
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

const sendResponseToClient = (res: Response<any, Record<string, any>, number>, rabbitmqServiceToUse: RabbitMQService, requestData: any) => {
  const rabbitmqServiceToUsehandler = requestResponseMap.getRequestService(requestData.handler);

  const responseMessageText = JSON.stringify(requestData);
  rabbitmqServiceToUse.sendMessage(responseMessageText, (error) => {
    
    if (error) {
      console.log('RabbitMQ is connected or Sending error:', error);
    }
    console.log('The Request was received and Sent to RabbitMQ');
    rabbitmqServiceToUsehandler?.onMessageReceived((message) => {
      res.status(200).json(message);
      });

  });

}

 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});