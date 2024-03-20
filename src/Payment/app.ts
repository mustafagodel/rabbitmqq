import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';

const app = express();
const port = process.env.PORT_5 || 3004;

const container = new Container();
configureContainer(container);
const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);

handlerQueue.listenForMessages('OrderQueue', async (response: any) => {
  const randomNumber = Math.random() * 5;
  if (randomNumber === 0) {
    const responseMessage = {
      error: "insufficient_balance"
    };
    const responseMessageText = JSON.stringify(responseMessage);
    handlerQueue.sendRabbitMQ('ResponseQueue', responseMessageText);
  } else {
    const responseMessage = {
      result: "succes"
    };
    const responseMessageText = JSON.stringify(responseMessage);
    handlerQueue.sendRabbitMQ('ResponseQueue', responseMessageText);
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});