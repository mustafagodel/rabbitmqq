import { inject, injectable } from 'inversify';
import { StockRepository } from './StockRepository';
import { Stock } from './Stock';
import { ObjectId } from 'mongodb';

@injectable()
export class StockService {
    constructor(@inject(StockRepository) private stockRepository: StockRepository) {}

    async addStock(productId: ObjectId, quantity: number, operation: 'increase stok' | 'decrease stok' | 'update stok' | 'rollback stok'): Promise<boolean> {
        const stock = new Stock(productId, quantity, operation);
        return await this.stockRepository.addStock(stock);
    }
}
