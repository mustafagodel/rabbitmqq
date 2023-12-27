import express from 'express';
import 'reflect-metadata';
import bodyParser, { json } from 'body-parser';
import { Container } from 'inversify';
import configureContainer from '../infrastructure/inversify.config';
import { AuthApp } from '../Auth/app/app.js';
import { OrderApp } from '../Order/app/app';
import ExecptionMiddleware from '../middleware/ExecptionMiddleware';
import  AuthMiddleware  from '../middleware/AuthMiddleware';
import { RabbitMQProvider } from '../infrastructure/RabbitMQProvider'; 
import { ProductApp } from '../Product/app/app';
import { ReturnApp } from '../Return/app/app';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';  

require('dotenv').config();
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Aggregator } from '../infrastructure/Aggregator';
import { Response } from 'express-serve-static-core';
const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExecptionMiddleware);
app.use(AuthMiddleware);


container.get<Aggregator>(Aggregator);
container.get<AuthApp>(AuthApp);
container.get<ProductApp>(ProductApp);
container.get<OrderApp>(OrderApp);
container.get<ReturnApp>(ReturnApp);
const requestResponseMap = container.get<RequestResponseMap>(RequestResponseMap);
app.post('/api', (req, res) => {
  const requestData = req.body;
  const rabbitmqServiceToUse = requestResponseMap.getRequestService('handleMessageAction');

  if (!rabbitmqServiceToUse) {
      return res.status(400).json({ error: 'Invalid action' });
  }

  if (!requestResponseMap.requiresToken(requestData.action)) {
      sendResponseToClient(res, rabbitmqServiceToUse, requestData);
      return;
  }

  const userToken = req.headers.authorization?.split(' ')[1];

  if (!userToken || typeof userToken !== 'string') {
      console.error('Invalid token: Token is missing or not a string.');
      return res.status(401).json({ error: 'Unauthorized' });
  }

  const roleToken = jwt.verify(userToken, process.env.SECRET_KEY as string) as JwtPayload;

  if (!requestResponseMap.requiresCustomerRole(requestData.action, roleToken.role) || roleToken.role === 'admin') {
      sendResponseToClient(res, rabbitmqServiceToUse, requestData);
  } else {
      res.status(401).json({ error: 'Not a valid role' });
  }
});



const sendResponseToClient = (
  res: Response<any, Record<string, any>, number>,
  rabbitmqServiceToUse: RabbitMQProvider,
  requestData: { action: string }
) => {
  const responseMessageText = JSON.stringify(requestData);
  rabbitmqServiceToUse.sendMessage(responseMessageText, (error) => {
    if (error) {
      console.log('RabbitMQ Sending error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    } 
        console.log('The Request was received and Sent to RabbitMQ');
        rabbitmqServiceToUse.onMessageReceived((message) => {
          const responseMessageText = JSON.parse(message);
          res.status(200).json(responseMessageText);
      });
      
   
  } );
  rabbitmqServiceToUse.onMessageReceived((message) => {
    const responseMessageText = JSON.parse(message);
    res.status(200).json(responseMessageText);
});




};



 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});