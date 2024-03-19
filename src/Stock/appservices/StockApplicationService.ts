import { inject, injectable } from 'inversify';
import { StockService } from '../domain/StockService';
import { ObjectId } from 'mongodb';

@injectable()
export class StockApplicationService {
    constructor(@inject(StockService) private stockService: StockService) {}

    async addStock(productId: ObjectId, quantity: number, operation: 'increase stok' | 'decrease stok' | 'update stok' | 'rollback stok'): Promise<boolean> {
        return await this.stockService.addStock(productId, quantity, operation);
    }
}
