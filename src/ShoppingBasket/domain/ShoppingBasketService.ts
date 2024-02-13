// ShoppingBasketService.ts

import { inject, injectable } from 'inversify';
import { ShoppingBasketRepository } from './ShoppingBasketRepository';
import { ShoppingBasket, ShoppingBasketitems } from './ShoppingBasket';
import { ObjectId } from 'mongodb';
import { OrderService } from '../../Order/domain/Order/OrderService';

@injectable()
export class ShoppingBasketService {
    constructor(
        @inject(ShoppingBasketRepository) private shoppingBasketRepository: ShoppingBasketRepository,
        @inject(OrderService) private orderService: OrderService
    ) { }

    async createShoppingBasket(userId: ObjectId, items: ShoppingBasketitems[]): Promise<ShoppingBasket | undefined> {
        const shoppingBasket = new ShoppingBasket(userId, items);
        const result = await this.shoppingBasketRepository.add(shoppingBasket);
        if (result.success) {
            return shoppingBasket;
        }
        return undefined;
    }

    async getUserShoppingBasket(userId: ObjectId): Promise<ShoppingBasket | undefined> {
        return this.shoppingBasketRepository.findById(userId);
    }

    async completeShoppingBasket(userId: ObjectId, items: any[], price: number): Promise<any> {
        try {
            const shoppingBasket = await this.getUserShoppingBasket(userId);
            if (!shoppingBasket) {
                throw new Error('Shopping basket not found for the user.');
            }


            const order = await this.orderService.createOrder(userId, items, price);
            if (!order) {
                throw new Error('Failed to create order.');
            }


            if (shoppingBasket) {
                return shoppingBasket;
            }

            await this.shoppingBasketRepository.delete(userId);
        } catch (error) {
            console.error('Error completing shopping basket:', error);
            throw new Error('Error completing shopping basket');
        }
    }
}
