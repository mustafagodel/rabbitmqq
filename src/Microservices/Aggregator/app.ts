import 'reflect-metadata';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { Aggregator } from './Aggregator';
import AuthMiddleware from '../../middleware/AuthMiddleware';
import Middleware from '../../middleware/Middleware';

const app = express();
const port = 1000;

const container = new Container();
configureContainer(container);

app.use(AuthMiddleware);
app.use(Middleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const aggreagtor = container.get<Aggregator>(Aggregator);
aggreagtor.handleMessage();

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});



