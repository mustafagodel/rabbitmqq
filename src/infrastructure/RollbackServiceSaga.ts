import { inject, injectable } from 'inversify';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService'; 
import { Stock } from './StockService';
@injectable()
export class RollbackService {
  constructor(@inject(ProductApplicationService) private productApplicationService: ProductApplicationService,@inject(Stock) private stock: Stock) {}

  async saga(messageData: any) {
    const itemsArray: any[] = messageData.items;
    for (const item of itemsArray) {
      const productName: string = item.productName;
      const quantity: number = item.quantity;
      const product = await this.productApplicationService.getProductByName(productName);

      let stockDifference = 0;
      if (messageData.action == 'completeShoppingBasket') {
        stockDifference = product.data.stock + quantity;
      } else if (messageData.action == 'createReturn') {
        stockDifference = product.data.stock - quantity;
      }
      await this.productApplicationService.updateProduct(product.data.id, product.data.type, productName, product.data.price, stockDifference);
      await this.stock.Stock(product.data.id, quantity, 'rollback stok');
    }
  }
}
