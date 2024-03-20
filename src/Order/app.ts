import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { OrderApplicationService } from './appservices/OrderApplicationService';
import { BaseRequest } from '../infrastructure/BaseRequset';
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';

const app = express();
const port = process.env.PORT_4 || 3003;

const container = new Container();
configureContainer(container);


const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
const orderApplicationService = container.get<OrderApplicationService>(OrderApplicationService);
handlerQueue.listenForMessages('OrderQueue', async (response: any) => {
  const messageData: BaseRequest = JSON.parse(response.content.toString());

  const appResponse = await orderApplicationService[messageData.action](messageData);
  handlerQueue.sendRabbitMQ('AggregatorQueue', JSON.stringify(appResponse));

});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});