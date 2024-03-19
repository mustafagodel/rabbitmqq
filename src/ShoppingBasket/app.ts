import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { ShoppingApp } from './app/app';

const app = express();
const port = process.env.PORT_8 || 3007;

const container = new Container();
configureContainer(container);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const shopping=container.get<ShoppingApp>(ShoppingApp);
shopping.handleMessage();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});