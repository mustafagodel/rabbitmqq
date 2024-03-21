import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
import { UserApplicationService } from './appservices/UserApplicationService';
import { BaseRequest } from '../../infrastructure/BaseRequset';
import AuthMiddleware from '../../middleware/AuthMiddleware';
import Middleware from '../../middleware/Middleware';


const app = express();
const port = 1002;

const container = new Container();
configureContainer(container);
app.use(AuthMiddleware);
app.use(Middleware);

const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
const userApplicationService = container.get<UserApplicationService>(UserApplicationService);
handlerQueue.listenForMessages('UserQueue', async (response: any) => {
  const messageData: BaseRequest = JSON.parse(response.content.toString());

  const appResponse = await userApplicationService[messageData.action](messageData);
  handlerQueue.sendRabbitMQ('AggregatorQueue', JSON.stringify(appResponse));

});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});

