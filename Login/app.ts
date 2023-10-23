import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from '../Login/src/infrastructure/inversify.config';
import { UserController } from '../Login/src/controller/UserController';
import Middleware from '../Login/src/middleware/ExecptionMiddleware';
import { UserApplicationService } from '../Login/src/appservices/UserApplicationService';
import PasswordService from '../Login/src/infrastructure/PasswordService';
import amqp from 'amqplib/callback_api'; 

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);

app.use(Middleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userController = container.get<UserController>(UserController);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api', (req, res) => {
  const requestData = req.body; 

  const rabbitmqServer = 'amqp://localhost'; 
  const queueName = 'Queue'; 

  amqp.connect(rabbitmqServer, (error, connection) => {
    if (error) {
      console.error('RabbitMQ bağlantı hatası:', error);
      res.status(500).send('RabbitMQ bağlantı hatası');
      return;
    }

    connection.createChannel((error, channel) => {
      if (error) {
        console.error('RabbitMQ kanalı oluşturma hatası:', error);
        res.status(500).send('RabbitMQ kanalı oluşturma hatası');
        connection.close();
        return;
      }

      channel.assertQueue(queueName, { durable: false });
      
      const message = JSON.stringify(requestData);
      
      channel.sendToQueue(queueName, Buffer.from(message));
      
      console.log('RabbitMQ\'ya istek gönderildi:', message);

      res.send('İstek alındı ve RabbitMQ\'ya iletiliyor.');

      setTimeout(() => {
        connection.close();
      }, 500);
    });
  });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});