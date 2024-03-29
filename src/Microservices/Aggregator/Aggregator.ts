import "reflect-metadata";
import fs from 'fs';
import { MessageRouter } from '../../infrastructure/MessageRouter';
import { inject, injectable } from 'inversify';
import { RabbitMQHandler } from "../../infrastructure/RabbitMQHandler";


@injectable()
export class Aggregator {
  public routes: any[] | undefined;
  private responsePromises: Promise<boolean>[] = [];
  constructor(
    @inject(MessageRouter) private readonly _messageRouter: MessageRouter,
    @inject(RabbitMQHandler) private readonly _handlerQueue: RabbitMQHandler,

  ) {

  }

  public handleMessage() {

    this.loadRoutes();

    this._handlerQueue.listenForMessages('AggregatorQueue', (response: any) => {
      const requestData = JSON.parse(response.content.toString());
      if (requestData.action) {
        this.handleMessageAction(response.content.toString());
      }
      else {
        const responseMessageText = JSON.stringify(requestData);
        this._handlerQueue.sendRabbitMQ('ApiGate', responseMessageText);
        return;
      }


    });


  }


  private async handleMessageAction(message: string) {

    const requestData = JSON.parse(message);
    const action = requestData.action;


    if (!this.routes) {
      console.error('Routes are not loaded');
      return;
    }

    const routes = this.routes.filter((r) => r.action === action);

    if (routes.length === 0) {
      console.error('Route not found for action:', action);
      return;
    }


    let promises: Promise<boolean>[] = [];
    for (const route of routes) {
      if (!route.microservices || route.microservices.length === 0) {
        const rabbitmqServiceToUse = this._messageRouter.getRequestService(action);
        const responseMessageText = JSON.stringify(requestData);
        this._handlerQueue.sendRabbitMQ(rabbitmqServiceToUse!, responseMessageText);
        break;
      }

      for (const microservice of route.microservices) {

        const { name, actionMessage } = microservice;
        const rabbitmqServiceToUse = this._messageRouter.getRequestService(actionMessage);


        if (!rabbitmqServiceToUse) {
          throw new Error(`RabbitMQ service not found for action: ${actionMessage}`);
        }

        console.log(`Processing action ${actionMessage} for microservice ${name}`);



        const microserviceRequestData = JSON.stringify({
          ...requestData,
          action: actionMessage,
        });



        promises.push(this.processMicroserviceRequest(name!));

        this._handlerQueue.sendRabbitMQ(rabbitmqServiceToUse!, microserviceRequestData);

      }


      await Promise.all(promises)
      this._handlerQueue.sendRabbitMQ('ApiGate', JSON.stringify({
        response: 'Process failed for microservice'
      }));
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


  private async processMicroserviceRequest(name?: string): Promise<boolean> {
    try {

      const responsePromise = new Promise<boolean>((resolve, reject) => {
        this._handlerQueue.listenForMessages('ResponseQueue', (response: any, channel: any) => {
          const responseMessage = JSON.parse(response.content.toString());
          if (responseMessage.data !== "succes") {
            console.log(`Failed response from ${name}`);
            resolve(false); 
          } else {
            console.log(`Successful response from ${name}`);
            resolve(true); 
          }
        });
      });

      return responsePromise;
  
    } catch (error) {
      console.error("Error occurred while processing microservice requests:", error);
      throw error; 
    }
  }
}







