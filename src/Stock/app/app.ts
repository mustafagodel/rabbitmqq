import { inject, injectable } from 'inversify';
import { StockApplicationService } from '../appservices/StockApplicationService';
import { ObjectId } from 'mongodb';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';

interface IStockMessageData {
    _id: string;
    productId: string;
    Stok: number;
    operation: 'increase stok' | 'decrease stok' | 'update stok' | 'rollback stok';
}

@injectable()
export class StockApp {
    constructor(
        @inject(StockApplicationService) private stockApplicationService: StockApplicationService,
        @inject(RabbitMQHandler) private rabbitMQHandler: RabbitMQHandler
    ) {
       
    }
    public handleMessage() {    
        this.rabbitMQHandler.listenForMessages('StockQueue', async (response:any) => {
            const messageData: IStockMessageData = JSON.parse(response.content.toString());
            this.handleActionMessage(messageData);
        });
  
      
    }
    private async handleActionMessage(messageData: IStockMessageData) {
        const _id = new ObjectId(messageData._id);
        const productId = new ObjectId(messageData.productId);
      
        await this.stockApplicationService.addStock(productId, messageData.Stok, messageData.operation);
    }
}
