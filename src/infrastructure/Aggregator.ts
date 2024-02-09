import fs from 'fs';
import jwt from 'jsonwebtoken';
import { ProductApp } from '../Product/app/app';
import { RabbitMQProvider } from './RabbitMQProvider';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';
import { inject, injectable } from 'inversify';
import { OrderApp } from '../Order/app/app';
import { AuthApp } from '../Auth/app/app';
import { ReturnApp } from '../Return/app/app';
import { ShoppingApp } from '../ShoppingBasket/app/app';
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
    @inject(ShoppingApp) private shoppingApp: ReturnApp,  
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
      }else{

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
    if (!route.microservices || route.microservices.length === 0) {
      const responseMessageText = JSON.stringify(requestData);
      console.log('messageText before sending:', responseMessageText);
      rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
        if (error) {
            console.log('RabbitMQ is connected or Sending error:', error);
        } 
            console.log('The Request was received and Sent to RabbitMQ');
     
    });
      return;
  }else{
    
    for (const microservice of route.microservices) {
      const { name, sagacontrol } = microservice;
      const microserviceController = this.getMicroserviceController(name);

      if (!microserviceController) {
          console.error('Microservice not found:', name);
          return;
      }

      if (sagacontrol) {
 
          await this.handleSaga(route, requestData,rabbitmqServiceToUse!,);
      } 
  }
}
    }
  }


private async handleSaga(route: any, requestData: any,rabbitmqServiceToUse: RabbitMQProvider) {
  console.log('Saga control is enabled for this route:', route);
  const connector = new MongoDBConnector();
  let session: ClientSession | null = null;
  let microserviceController: any | null = null;

  try {
      await connector.connect();
      session = await connector.startTransaction();

      for (const microservice of route.microservices) {
          const { name, actionMessage } = microservice;
           microserviceController = this.getMicroserviceController(name);

          if (!microserviceController) {
              console.error('Microservice not found:', name);
              return;
          }

          console.log(microserviceController);

          await microserviceController[actionMessage](requestData);
          const resultRabbitMQMessage= await this.waitForRabbitMQMessage();
       
          if (resultRabbitMQMessage.result == 'succes') {

            const responseMessageText = JSON.stringify(requestData);
            rabbitmqServiceToUse?.sendMessage(responseMessageText, (error) => {
                if (error) {
                    console.log('RabbitMQ is connected or Sending error:', error);
                }
                console.log('The Request was received and Sent to RabbitMQ');
               
            });
   
       
        } else {
            const errorMessage = { error: resultRabbitMQMessage };
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
                        connector.commitTransaction(session);
                  } catch (rollbackError) {
                      console.error('Rollback failed:', rollbackError);
                      throw rollbackError; 
                  }
                }
                
            });
            await connector.commitTransaction(session);
        }
        const resultMQ = await this.waitForRabbitMQMessage();
        if(resultMQ.result){
   const errorMessage = { error: resultMQ };
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
                  connector.commitTransaction(session);
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
            if (microserviceController) {
              await  microserviceController['rollback'](requestData);
               }
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
private async waitForRabbitMQMessage(): Promise<any> {
  return new Promise((resolve, reject) => {
    const listener = (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.result) {
         resolve(parsedMessage);
    }else{
      const responseMessageText = JSON.stringify(parsedMessage);
     this.apiGateWayRabbitMQProviderQueue?.sendMessage(responseMessageText, (error) => {
        if (error) {
            console.log('RabbitMQ is connected or Sending error:', error);
        } 
            console.log('The Request was received and Sent to RabbitMQ');
     
    });
  }
   
    };
    this.aggregatorRabbitMQProviderQueue.onMessageReceived(listener);
    
  });

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
  }else if(microserviceName=='ShoppingBasket'){
    return this.shoppingApp;
  }
    return null;
  }

}



