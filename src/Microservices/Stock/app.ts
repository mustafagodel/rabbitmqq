import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
import { BaseRequest } from '../../infrastructure/BaseRequset';
import { StockApplicationService } from './appservices/StockApplicationService';
import AuthMiddleware from '../../middleware/AuthMiddleware';
import Middleware from '../../middleware/Middleware';

const app = express();
const port = 1008;

app.use(AuthMiddleware);
app.use(Middleware);

const container = new Container();
configureContainer(container);
const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
const stockApplicationService = container.get<StockApplicationService>(StockApplicationService);
handlerQueue.listenForMessages('StockQueue', async (response: any) => {
  const messageData: BaseRequest = JSON.parse(response.content.toString());
 await stockApplicationService[messageData.action](messageData);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});