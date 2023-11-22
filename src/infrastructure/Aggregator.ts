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
  [x: string]: any;
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
    this.aggregatorRabbitMQServiceQueue.onMessageReceived((message: string) => {
      this.handleMessageAction(message);
  });


  
  }
  public async handleMessageAction(message: string,) {

    const requestData = JSON.parse(message);
    const action = requestData.handler;
    const request=requestData.action;
    const rabbitmqServiceToUse = this.requestResponseMap.getRequestService(action);


    
    if (!this.routes) {
      console.error('Routes are not loaded');

      return;
    }
  
    const routes = this.routes.filter((r) => r.handler === action);
  
    if (routes.length === 0) {
      console.error('Route not found for action:', action);

      return;
    }
  
    for (const route of routes) {
      if (!route.microservices) continue;
      for (const microservice of route.microservices) {
        const { name, handler, check } = microservice;
        const microserviceController = this.getMicroserviceController(name);
  
        if (!microserviceController) {
          console.error('Microservice not found:', name);
        
          return;
        }
  
        console.log(microserviceController);
  
        if (check === 'notnecessary') {
          
          const responseMessageText = JSON.stringify(requestData);
          console.log('messageText before sending:', responseMessageText);
          rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
            if (error) {
              console.log('RabbitMQ is connected or Sending error:', error);
            }
            console.log('The Request was received and Sent to RabbitMQ');
          });
          break;
        }
  
   
          const resultProduct = await microserviceController[handler](requestData);
          if (resultProduct === 'succes') {
            const responseMessageText = JSON.stringify(requestData);
            
            rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
              if (error) {
                console.log('RabbitMQ is connected or Sending error:', error);

              }
              console.log('The Request was received and Sent to RabbitMQ');
            });
           
          } else {
            const responseMessage = {
              response:"stok yok" ,
          };
            const responseMessageText = JSON.stringify(responseMessage);
            rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
              if (error) {
                console.log('RabbitMQ is connected or Sending error:', error);
              }
              console.log('The Request was received and Sent to RabbitMQ');
        
            });
   
          }
        
      }
    
  }
   
    
}


private loadRoutes() {
  try {

    if (fs.existsSync('routes.json')) {
      const rawData = fs.readFileSync('routes.json');
      this.routes = JSON.parse(rawData.toString()).routes;
      console.log('Routes loaded successfully.');
    } else {
      console.error('Error: File "routes.json" does not exist.');

    }
  } catch (error) {
    console.error('Error loading routes:', error);

  }
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


 
