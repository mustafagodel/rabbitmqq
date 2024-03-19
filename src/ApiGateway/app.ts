import express from 'express';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { Container } from 'inversify';
import configureContainer from './inversify.config';
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';
import { MessageRouter } from '../infrastructure/MessageRouter';
import AuthMiddleware from '../middleware/AuthMiddleware';
import Middleware from '../middleware/Middleware';
import jwt, { JwtPayload } from 'jsonwebtoken';
const app = express();
const port = process.env.PORT || 3000;

const container = new Container();
configureContainer(container);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(AuthMiddleware);
app.use(Middleware);

const requestResponseMap = container.get<MessageRouter>(MessageRouter);
const handlerQueue = container.get<RabbitMQHandler>(RabbitMQHandler);
let currentResponse: express.Response; 

handlerQueue.listenForMessages('ApiGate', (response: any) => {
    const messageData = JSON.parse(response.content.toString());
    currentResponse.status(200).json(messageData);
    return;
    });


app.post('/api', async (req, res) => {
    currentResponse = res; 
    const requestData = req.body;


    if (!requestData.action) {
       res.status(400).json({ error: 'Invalid action' });
       return;
    }
  
    if (!requestResponseMap.requiresToken(requestData.action)) {
        const responseMessageText = JSON.stringify(requestData);
        await handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
        return;
    }
  
    const userToken = req.headers.authorization?.split(' ')[1];
  
    if (!userToken || typeof userToken !== 'string') {
      console.error('Invalid token: Token is missing or not a string.');
       res.status(401).json({ error: 'Unauthorized' });
       return;
    }
  
    const roleToken = jwt.verify(userToken, process.env.SECRET_KEY as string) as JwtPayload;
  
    if (!requestResponseMap.requiresCustomerRole(requestData.action, roleToken.role) || roleToken.role === 'admin') {
        const responseMessageText = JSON.stringify(requestData);
        await handlerQueue.sendRabbitMQ('AggregatorQueue', responseMessageText);
        return;
    } else {
  
      res.status(401).json({ error: 'Not a valid role' });
      return;
    }
  
  
  });


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
