import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { StockApp } from './app/app';

const app = express();
const port = 3008;

const container = new Container();
configureContainer(container);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const stock=container.get<StockApp>(StockApp);
stock.handleMessage();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});