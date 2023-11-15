import fs from 'fs';
import jwt from 'jsonwebtoken';
import { ProductApp } from '../Product/app/app';
import { RabbitMQService } from '../infrastructure/RabbitMQService';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';
import { inject, injectable } from 'inversify';
import { OrderApp } from '../Order/app/app';
import { AuthApp } from '../Auth/app/app';

@injectable()
export class Aggregator {
  public routes: any[] | undefined;

  constructor(
    @inject('AggregatorRabbitMQServiceQueue') private aggregatorRabbitMQServiceQueue: RabbitMQService,
    @inject(ProductApp) private productApp: ProductApp,
    @inject(OrderApp) private orderApp: OrderApp,
    @inject(AuthApp) private authApp: AuthApp,
    @inject(RequestResponseMap) private requestResponseMap: RequestResponseMap
  ) {
    this.productApp = productApp;
    this.orderApp = orderApp;
    this.authApp = authApp;

    this.requestResponseMap = requestResponseMap;
    this.aggregatorRabbitMQServiceQueue = aggregatorRabbitMQServiceQueue;
    this.loadRoutes();
  }

  public async handleRequest(
    requestData: any,
    rabbitmqServiceToUse: RabbitMQService,
    res: any
  ): Promise<void> {
    const action = requestData.action;
  
    if (!this.routes) {
      console.error('Routes are not loaded');
      return res.status(500).json({ error: 'Routes are not loaded' });
    }
  
    const routes = this.routes.filter((r) => r.action === action);
  
    if (routes.length === 0) {
      console.error('Route not found for action:', action);
      return res.status(500).json({ error: 'Route not found' });
    }
  
    for (const route of routes) {
      if (!route.microservices) continue;
      for (const microservice of route.microservices) {
        const { name, handler, AppService ,check} = microservice;
        const microserviceController = this.getMicroserviceController(name);
  
        if (!microserviceController) {
          console.error('Microservice not found:', name);
          return res.status(500).json({ error: 'Microservice not found' });
        }
  
        console.log(microserviceController);
 
          if(check=='notnecessary'){
            const responseMessageText = JSON.stringify(requestData);
            sendResponseToClient(res, rabbitmqServiceToUse, responseMessageText);
            break;
          }
           const resultProduct = await microserviceController[handler](requestData);
          if (resultProduct === 'succes') {             
              const responseMessageText = JSON.stringify(requestData);
              sendResponseToClient(res, rabbitmqServiceToUse, responseMessageText);
            }else{
              return res.status(500).json({ error: 'Out of stock' });
            }
      
        
      }
    }
  }
  private loadRoutes() {
    const rawData = fs.readFileSync('routes.json');
    this.routes = JSON.parse(rawData.toString()).routes;
  }


  private getMicroserviceController(microserviceName: string): any | null {
    if (microserviceName === 'product') {
      return this.productApp;
    }
    else if(microserviceName=='order'){
    return this.orderApp;

  } else if(microserviceName=='auth'){
  return this.authApp;

}
  return null;
}

}
const sendResponseToClient = (res, rabbitmqServiceToUse, messageText) => {
  rabbitmqServiceToUse.sendMessage(messageText, (error) => {
    if (error) {
      console.log('RabbitMQ is connected or Sending error:', error);
      return res.status(500).json(error);
    }
    console.log('The Request was received and Sent to RabbitMQ');

    rabbitmqServiceToUse.onMessageReceived((message) => {
      const messageData = JSON.parse(message);
      res.status(200).json(messageData);
    });
  })
};
