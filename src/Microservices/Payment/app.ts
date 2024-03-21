import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
import AuthMiddleware from '../../middleware/AuthMiddleware';
import Middleware from '../../middleware/Middleware';
import { PaymentApplicationService } from './appservices/PaymentApplicationService';
import { BaseRequest } from '../../infrastructure/BaseRequset';

const app = express();
const port = 1004;

const container = new Container();
configureContainer(container);

app.use(AuthMiddleware);
app.use(Middleware);
const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
const paymentApplicationService = container.get<PaymentApplicationService>(PaymentApplicationService);

handlerQueue.listenForMessages('OrderQueue', async (response: any) => {

  const messageData: BaseRequest = JSON.parse(response.content.toString());
   const appResponse = await paymentApplicationService[messageData.action](messageData);
    handlerQueue.sendRabbitMQ('ResponseQueue', appResponse);
  
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});