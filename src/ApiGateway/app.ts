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
app.post('/api', (req, res) => {
  const requestData = req.body;
  const messageText = JSON.stringify(requestData);

  const rabbitmqServiceToUse = requestResponseMap.getRequestService(requestData.action);
  if (!rabbitmqServiceToUse) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (requestData.action === 'login' || requestData.action === 'register') {

    rabbitmqServiceToUse.sendMessage(messageText, (error) => {
      if (error) {
        console.log('RabbitMQ is connected or Sending error:', error);
        return res.status(500).json(error);
      }
      console.log('The Request was received and Sent RabbitMQ');

      rabbitmqServiceToUse.onMessageReceived((message) => {
        const messageData = JSON.parse(message);

        
        const userToken = messageData.token;

        if (userToken) {
          
          req.headers.authorization = userToken;
        }

        res.status(200).json(messageData);
      });
    });
  } else {
  
    const userToken = req.headers.authorization;

    if (userToken && typeof userToken === 'string') {
      jwt.verify(userToken, secretKey, (err, decoded) => {
       
        const user = decoded;

        rabbitmqServiceToUse.sendMessage(messageText, (error) => {
          if (error) {
            console.log('RabbitMQ is connected or Sending error:', error);
            return res.status(500).json(error);
          }
          console.log('The Request was received and Sent RabbitMQ');

          rabbitmqServiceToUse.onMessageReceived((message) => {
            const messageData = JSON.parse(message);
            res.status(200).json(messageData);
          });
        });
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


