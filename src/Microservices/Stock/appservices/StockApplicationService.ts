import { inject, injectable } from 'inversify';
import { StockService } from '../domain/StockService';
import { IStockMessageData } from '../dto/Response/interfaces';


@injectable()
export class StockApplicationService {
    [key: string]: any;
    constructor(@inject(StockService) private stockService: StockService) {}

    async addStock(stockdata:IStockMessageData): Promise<boolean> {
        return await this.stockService.addStock(stockdata);
    }
}
