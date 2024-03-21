import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
import { ShoppingBasketApplicationService } from './appservices/ShoppingBasketApplicationService';
import { BaseRequest } from '../../infrastructure/BaseRequset';
import AuthMiddleware from '../../middleware/AuthMiddleware';
import Middleware from '../../middleware/Middleware';

const app = express();
const port = 1007;

app.use(AuthMiddleware);
app.use(Middleware);

const container = new Container();
configureContainer(container);
const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
const shoppingBasketApplicationService = container.get<ShoppingBasketApplicationService>(ShoppingBasketApplicationService);
handlerQueue.listenForMessages('ReturnQueue', async (response: any) => {
  const messageData: BaseRequest = JSON.parse(response.content.toString());

  const appResponse = await shoppingBasketApplicationService[messageData.action](messageData);
  handlerQueue.sendRabbitMQ('AggregatorQueue', JSON.stringify(appResponse));

});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});