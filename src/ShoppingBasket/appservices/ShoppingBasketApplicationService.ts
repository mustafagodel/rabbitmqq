import { inject, injectable } from 'inversify';
import { ShoppingBasketService } from '../../ShoppingBasket/domain/ShoppingBasketService';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ShoppingBasket, ShoppingBasketitems } from '../../ShoppingBasket/domain/ShoppingBasket';
import { ObjectId } from 'mongodb';

@injectable()
export class ShoppingBasketApplicationService {
    constructor(private shoppingListService: ShoppingBasketService) { }

    async createShoppingBasket(userId: ObjectId, items: ShoppingBasketitems[]): Promise<ApiResponse<any>> {
        const createdbasket = await this.shoppingListService.createShoppingBasket(userId, items);
        if (createdbasket) {
            return new ApiResponse(0, 'Shopping Basket Added Product', createdbasket);
        } else {
            return new ApiResponse(1, 'Failed to Added Product', null);
        }
    }
    async getUserShoppingBasket(userId: ObjectId): Promise<ApiResponse<any>> {
        const ShoppingBasket = await this.shoppingListService.getUserShoppingBasket(userId);

        if (ShoppingBasket) {
            return new ApiResponse(0, 'Shopping Basket successfully', ShoppingBasket);
        }
        return new ApiResponse(1, 'Shopping Basket not found', null);

    }
    async completeShoppingBasket(userId: ObjectId, items: ShoppingBasketitems[], price: number): Promise<ApiResponse<any>> {
        const ShoppingBasket = await this.shoppingListService.completeShoppingBasket(userId, items, price);

        if (ShoppingBasket) {
            return new ApiResponse(0, 'Shopping Basket Successfully Complete ', ShoppingBasket);
        }
        return new ApiResponse(1, 'Shopping Basket not completed', null);

    }
}