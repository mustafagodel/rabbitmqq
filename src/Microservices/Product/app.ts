import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { ProductApplicationService } from './appservices/ProductApplicationService';
import { BaseRequest } from '../../infrastructure/BaseRequset';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
import AuthMiddleware from '../../middleware/AuthMiddleware';
import Middleware from '../../middleware/Middleware';
import { ProductApp } from './app/app';

const app = express();
const port = 1005;

const container = new Container();
configureContainer(container);
app.use(AuthMiddleware);
app.use(Middleware);
 const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
const productApplicationService = container.get<ProductApplicationService>(ProductApplicationService);
handlerQueue.listenForMessages('ProductQueue', async (response: any) => {
  const messageData: BaseRequest = JSON.parse(response.content.toString());
   const appResponse = await productApplicationService[messageData.action](messageData);
  handlerQueue.sendRabbitMQ('AggregatorQueue', JSON.stringify(appResponse));
 });

const productApp = container.get<ProductApp>(ProductApp);
productApp.handleMessage();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});