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
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';  
require('dotenv').config();
import jwt from 'jsonwebtoken';
const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);
app.use(Middleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
container.get<UserController>(UserController);
container.get<ProductController>(ProductController);
const requestResponseMap = container.get<RequestResponseMap>(RequestResponseMap);
const secretKey = process.env.SECRET_KEY as string; 
app.post('/api', async (req, res) => {
  try {
    const requestData = req.body;
    const messageText = JSON.stringify(requestData);

    const rabbitmqServiceToUse = requestResponseMap.getRequestService(requestData.action);

    if (!rabbitmqServiceToUse) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (requestResponseMap.requiresToken(requestData.action)) {
      const userToken = req.headers.authorization;

      if (!userToken || typeof userToken !== 'string') {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decoded = await jwt.verify(userToken, secretKey);

      const user = decoded;

      await sendMessageAndHandleResponse(rabbitmqServiceToUse, messageText, res);
    } else {
      await sendMessageAndHandleResponse(rabbitmqServiceToUse, messageText, res);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function sendMessageAndHandleResponse(rabbitmqService, messageText, res) {
  try {
    await rabbitmqService.sendMessage(messageText);
    console.log('The Request was received and Sent to RabbitMQ');

    rabbitmqService.onMessageReceived((message) => {
      const messageData = JSON.parse(message);
      res.status(200).json(messageData);
    });
  } catch (error) {
    console.error('RabbitMQ is connected or Sending error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


