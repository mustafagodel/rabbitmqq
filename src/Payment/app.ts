import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { PaymentApp } from './app/app';

const app = express();
const port = process.env.PORT_5 || 3004;

const container = new Container();
configureContainer(container);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const payment=container.get<PaymentApp>(PaymentApp);
payment.handleMessage();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});