import fs from 'fs';
import jwt from 'jsonwebtoken';
import { ProductApp } from '../Product/app/app';
import { RabbitMQProvider } from './RabbitMQProvider';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';
import { inject, injectable } from 'inversify';
import { OrderApp } from '../Order/app/app';
import { AuthApp } from '../Auth/app/app';
import { ReturnApp } from '../Return/app/app';
import { channel } from 'diagnostics_channel';
import amqplib,{ ConsumeMessage, connect }  from 'amqplib/callback_api';
import { MongoDBConnector } from './db';
import { ClientSession } from 'mongodb';
@injectable()
export class Aggregator {
  public routes: any[] | undefined;


 
 
  constructor(
    @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
    @inject('ApiGateWayRabbitMQProviderQueue') private apiGateWayRabbitMQProviderQueue: RabbitMQProvider,
    @inject(ProductApp) private productApp: ProductApp,
    @inject(OrderApp) private orderApp: OrderApp,
    @inject(AuthApp) private authApp: AuthApp,
    @inject(ReturnApp) private returnApp: ReturnApp,  
    @inject(RequestResponseMap) private requestResponseMap: RequestResponseMap,
) {

  this.returnApp = returnApp;
    this.productApp = productApp;
    this.orderApp = orderApp;
    this.authApp = authApp;
    this.requestResponseMap = requestResponseMap;
    this.aggregatorRabbitMQProviderQueue = aggregatorRabbitMQProviderQueue;
    this.loadRoutes();

     this.aggregatorRabbitMQProviderQueue.onMessageReceived((message) => {

      const requestData = JSON.parse(message);
      
      if (requestData.action) {
          this.handleMessageAction(message);
        
 
      } else{

        const responseMessageText = JSON.stringify(requestData);
       this.apiGateWayRabbitMQProviderQueue?.sendMessage(responseMessageText, (error) => {
          if (error) {
              console.log('RabbitMQ is connected or Sending error:', error);
          } 
              console.log('The Request was received and Sent to RabbitMQ');
       
      });
    }
  

  });

 
}
public async handleMessageAction(message: string) {
  const requestData = JSON.parse(message);
  const action = requestData.action;
  const rabbitmqServiceToUse = this.requestResponseMap.getRequestService(requestData.action);

  if (!this.routes) {
      console.error('Routes are not loaded');
      return;
  }

  const routes = this.routes.filter((r) => r.action === action);

  if (routes.length === 0) {
      console.error('Route not found for action:', action);
      return;
  }

  for (const route of routes) {
    for (const microservice of route.microservices) {
      const { name, sagacontrol } = microservice;
      const microserviceController = this.getMicroserviceController(name);

      if (!microserviceController) {
          console.error('Microservice not found:', name);
          return;
      }

      if (sagacontrol) {
          // If saga control is true, start the saga
          await this.handleSaga(route, requestData,rabbitmqServiceToUse!);
      } else {
          // Otherwise, execute the microservices directly
          await this.executeMicroservices(route, requestData, rabbitmqServiceToUse!);
      }
  }
}
}

private async handleSaga(route: any, requestData: any,rabbitmqServiceToUse: RabbitMQProvider) {
  console.log('Saga control is enabled for this route:', route);
  const connector = new MongoDBConnector();
  let session: ClientSession | null = null;

  try {
      await connector.connect();
      session = await connector.startTransaction();

      for (const microservice of route.microservices) {
          const { name, actionMessage } = microservice;
          const microserviceController = this.getMicroserviceController(name);

          if (!microserviceController) {
              console.error('Microservice not found:', name);
              return;
          }

          console.log(microserviceController);

          const resultProduct = await microserviceController[actionMessage](requestData);
       

          if (resultProduct == 'succes') {

            const responseMessageText = JSON.stringify(requestData);
            rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
                if (error) {
                    console.log('RabbitMQ is connected or Sending error:', error);
                }
                console.log('The Request was received and Sent to RabbitMQ');
                try {
                   connector.commitTransaction(session!);
                  console.log('Transaction committed successfully.');
              } catch (commitError) {
                  console.error('Commit failed:', commitError);
                  throw commitError; 
              }
            });
        } else {
            const errorMessage = { error: resultProduct };
            const responseMessageText = JSON.stringify(errorMessage);
            this.apiGateWayRabbitMQProviderQueue?.sendMessage(responseMessageText, (error) => {
                if (error) {
                    console.log('RabbitMQ is connected or Sending error:', error);
                }
                console.log('The Request was received and Sent to RabbitMQ');
                if (session) {
                  try {
                       connector.rollbackTransaction(session);
                       microserviceController['rollback'](requestData);
                  } catch (rollbackError) {
                      console.error('Rollback failed:', rollbackError);
                      throw rollbackError; 
                  }
                }
            });
        }
      }

      await connector.commitTransaction(session);
      console.log('SagaMiddleware: İşlem tamamlandı.');
  } catch (error: any) {
      console.error('SagaMiddleware: Hata:', error);
      if (session) {
          try {
              await connector.rollbackTransaction(session);
        
          } catch (rollbackError) {
              console.error('Rollback failed:', rollbackError);
              throw rollbackError; 
          }
      }
  } finally {
      if (session) {
          session.endSession();
      }
  }
}






private async executeMicroservices(route: any, requestData: any, rabbitmqServiceToUse: RabbitMQProvider) {
  for (const microservice of route.microservices) {
      const { name, actionMessage } = microservice;
      const microserviceController = this.getMicroserviceController(name);

      if (!microserviceController) {
          console.error('Microservice not found:', name);
          return;
      }

      console.log(microserviceController);

      const resultProduct = await microserviceController[actionMessage](requestData);
      if (resultProduct == 'success') {
          const responseMessageText = JSON.stringify(requestData);
          rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
              if (error) {
                  console.log('RabbitMQ is connected or Sending error:', error);
              }
              console.log('The Request was received and Sent to RabbitMQ');
          });
      } else {
          const errorMessage = { error: resultProduct };
          const responseMessageText = JSON.stringify(errorMessage);
          this.apiGateWayRabbitMQProviderQueue?.sendMessage(responseMessageText, (error) => {
              if (error) {
                  console.log('RabbitMQ is connected or Sending error:', error);
              }
              console.log('The Request was received and Sent to RabbitMQ');
          });
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
    else if (microserviceName == 'order') {
      return this.orderApp;

    } else if (microserviceName == 'auth') {
      return this.authApp;

    }
   else if (microserviceName == 'return') {
    return this.returnApp;
  }
    return null;
  }

}



