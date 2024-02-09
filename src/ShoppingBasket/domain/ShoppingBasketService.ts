import { inject, injectable } from 'inversify';
import { ShoppingBasketRepository } from './ShoppingBasketRepository';
import { ShoppingBasket ,ShoppingBasketitems} from './ShoppingBasket';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ObjectId } from 'mongodb';

@injectable()
export class ShoppingBasketService {
    constructor(@inject(ShoppingBasketRepository) private shoppingBasketRepository: ShoppingBasketRepository) {}

    async createShoppingBasket(userId: ObjectId, items: ShoppingBasketitems[]):  Promise<ShoppingBasket | undefined> {
        const shoppingBasket=new ShoppingBasket(userId, items);
        const result = await this.shoppingBasketRepository.add(shoppingBasket);
        if (result.success) {
            return shoppingBasket;
        }
        return undefined;
    }
    }
