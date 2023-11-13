import jwt from 'jsonwebtoken';
import { ProductApp } from '../Product/app/app';
import { RabbitMQService } from '../infrastructure/RabbitMQService';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';
import { inject, injectable } from 'inversify';
@injectable()
export class Aggregator {
  


  constructor(  @inject(ProductApp) private productController: ProductApp, @inject(RequestResponseMap) private requestResponseMap: RequestResponseMap,) {
    this.productController = productController;
    this.requestResponseMap = requestResponseMap;
  }

  public async handleCreateOrder(
    requestData: any,
    rabbitmqServiceToUse: RabbitMQService,
    res: any
  ): Promise<void> {
      const action = requestData.action;

      if (action === 'createOrder') {
        const stockCheckResult = await this.productController.checkAndDecreaseStock(requestData);

        if (stockCheckResult === 'success') {
          this.sendResponseToClient(res, rabbitmqServiceToUse, JSON.stringify(requestData));
        } else {
          const errorResponseMessage = {
            message: 'Yetersiz stok',
          };
          const errorResponseMessageText = JSON.stringify(errorResponseMessage);
          this.sendResponseToClient(res, rabbitmqServiceToUse, errorResponseMessageText);
        }
      }
    };
  

  private sendResponseToClient(res: any, rabbitmqServiceToUse: RabbitMQService, messageText: string) {
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
    });
  }
}