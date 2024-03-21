import { inject, injectable } from 'inversify';
import { StockRepository } from './StockRepository';
import { Stock } from './Stock';
import { IStockMessageData } from '../dto/Response/interfaces';

@injectable()
export class StockService {
    constructor(@inject(StockRepository) private stockRepository: StockRepository) {}

    async addStock(stockdata:IStockMessageData): Promise<boolean> {
        const stock = new Stock(stockdata.productId,stockdata.Stok, stockdata.operation);
        return await this.stockRepository.addStock(stock);
    }
}
