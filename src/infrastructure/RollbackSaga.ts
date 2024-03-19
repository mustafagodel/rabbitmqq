import { inject, injectable } from 'inversify';
import { RabbitMQHandler } from './RabbitMQHandler';

@injectable()
export class Rollback {
  constructor(@inject(RabbitMQHandler) private RabbitMQHandler: RabbitMQHandler) {}

  async saga(messageData: any) {
    const itemsArray: any[] = messageData.items;
    const promises: Promise<void>[] = []; 

    for (const item of itemsArray) {
      const productName: string = item.productName;
      const quantity: number = item.quantity;
      const getProductMessage = {
        action: 'getNameProduct',
        productName: productName
      };
      this.RabbitMQHandler.sendRabbitMQ('ProductQueue', JSON.stringify(getProductMessage));
      const promise = new Promise<void>((resolve, reject) => {
        this.RabbitMQHandler.listenForMessages('RollBack', async (response: any) => {
          const requestData = JSON.parse(response.content.toString());
          let stockDifference = requestData.response.data.stock;
          
  
          if (messageData.action === 'completeShoppingBasket') {
            stockDifference += quantity;
          } else if (messageData.action === 'createReturn') {
            stockDifference -= quantity;
          }
          
          const responseMessage = {
            action: 'updateProduct',
            id: requestData.response.data.id, 
            type: requestData.response.data.type, 
            name: productName,
            price: requestData.response.data.price, 
            stock: stockDifference,
          };
          const stockMessage = {
            productId: requestData.response.data.id,
            Stok:  messageData.stock,
            operation: 'rollback stok'
        };
     
        const stockMessageText = JSON.stringify(stockMessage);
        this.RabbitMQHandler.sendRabbitMQ('StockQueue', stockMessageText);

          this.RabbitMQHandler.sendRabbitMQ('ProductQueue', JSON.stringify(responseMessage));
          resolve(); 
        });
      });

      promises.push(promise); 
 
    }
    await Promise.all(promises);
  }
}
