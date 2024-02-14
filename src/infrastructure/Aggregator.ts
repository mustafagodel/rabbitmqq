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
import amqplib, { ConsumeMessage, connect } from 'amqplib/callback_api';
import { MongoDBConnector } from './db';
import { ClientSession } from 'mongodb';
import { PaymentApp } from '../Payment/app/app';
import { RollbackService } from './RollbackServiceSaga';
@injectable()
export class Aggregator {
  public routes: any[] | undefined;
  private processingCompleted: boolean = false;

  constructor(
    @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
    @inject('ApiGateWayRabbitMQProviderQueue') private apiGateWayRabbitMQProviderQueue: RabbitMQProvider,
    @inject(ProductApp) private productApp: ProductApp,
    @inject(OrderApp) private orderApp: OrderApp,
    @inject(AuthApp) private authApp: AuthApp,
    @inject(ReturnApp) private returnApp: ReturnApp,
    @inject(ShoppingApp) private shoppingApp: ReturnApp,
    @inject(PaymentApp) private PaymentApp: PaymentApp,
    @inject(RequestResponseMap) private requestResponseMap: RequestResponseMap,
    @inject(RollbackService) private RollbackService: RollbackService,

  ) {


    this.requestResponseMap = requestResponseMap;
    this.aggregatorRabbitMQProviderQueue = aggregatorRabbitMQProviderQueue;
    this.loadRoutes();


    aggregatorRabbitMQProviderQueue.onMessageReceived((message) => {
      const requestData = JSON.parse(message);
      if (requestData.action) {
        this.handleMessageAction(message);
      } else {
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

  public handleMessageAction(message: string) {

    const requestData = JSON.parse(message);
    const action = requestData.action;
    const rabbitmqServiceToUse = this.requestResponseMap.getRequestService(requestData.action);

    this.handleSaga(requestData, rabbitmqServiceToUse!);

  }


  async handleSaga(requestData: any, rabbitmqService: RabbitMQProvider) {

    if (this.processingCompleted) {
      console.log("Processing already completed, exiting early.");
      return;
    }

    const connector = new MongoDBConnector();
    let session: ClientSession | null = null;
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
    try {
      connector.connect();
      session = await connector.startTransaction();

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
          break;
        }


        for (const microservice of route.microservices) {
          const { name, actionMessage } = microservice;

          const rabbitmqServiceToUse = this.requestResponseMap.getRequestService(actionMessage);

          if (!rabbitmqServiceToUse) {
            throw new Error(`RabbitMQ service not found for action: ${actionMessage}`);
          }

          console.log(`Processing action ${actionMessage} for microservice ${name}`);


       
          const microserviceRequestData = JSON.stringify({
            ...requestData,
            action: actionMessage,
          });
  
          const isSuccess = await this.processMicroserviceRequest(microserviceRequestData, rabbitmqServiceToUse, name);
  


          if (!isSuccess) {
            const microserviceRequestDataw = JSON.stringify({
              response: 'Process failed for microservice ${name}, rolling back...`'
            });
            rabbitmqServiceToUse.sendMessage(microserviceRequestDataw, (error) => {
              if (error) {
                console.error(`Error sending message to ${name}:`, error);
                this.RollbackService.saga(requestData);
                return;
              }
            });
          }

        }
      }
      await connector.commitTransaction(session);
      console.log('Saga completed successfully');

    } catch (error) {
      console.error('Saga failed:', error);
      if (session) {
        await connector.rollbackTransaction(session);
      }
      this.RollbackService.saga(requestData);
      await this.sendConclusionMessage();

    } finally {
      if (session) {
        session.endSession();
      }
      this.processingCompleted = true;
    }

  }
  private async sendConclusionMessage() {
    const conclusionMessage = JSON.stringify({
      response: 'completed',
      detail: 'The saga has ended. Resources have been cleaned up.',
    });

    this.apiGateWayRabbitMQProviderQueue?.sendMessage(conclusionMessage, (error) => {
      if (error) {
        console.log('RabbitMQ is connected or Sending error:', error);
      }
      console.log('The Request was received and Sent to RabbitMQ');

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
  private async processMicroserviceRequest(microserviceRequestData: string, rabbitmqServiceToUse: RabbitMQProvider, name: string) {
    return new Promise<boolean>((resolve) => {
      rabbitmqServiceToUse.sendMessage(microserviceRequestData, (error) => {
        if (error) {
          console.error(`Error sending message to ${name}:`, error);
          resolve(false);
          return;
        }
        this.aggregatorRabbitMQProviderQueue.onMessageReceived((response) => {
          const responseMessage = JSON.parse(response);
          if (responseMessage.result == "succes") {
            console.log(`Successful response from ${name}`);
            resolve(true);
          } else if (responseMessage.response) {
            const responseMessageText = JSON.stringify(responseMessage);
            this.apiGateWayRabbitMQProviderQueue?.sendMessage(responseMessageText, (error) => {
              if (error) {
                console.log('RabbitMQ is connected or Sending error:', error);
              }
              console.log('The Request was received and Sent to RabbitMQ');
            });
          } else if (responseMessage.action) {
            this.handleMessageAction(response);
          } else {
            console.log(`Failed response from ${name}`);
            resolve(false);
          }
        });
      });
    });
  }
}



