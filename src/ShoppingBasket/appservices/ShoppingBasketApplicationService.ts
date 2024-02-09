import { inject, injectable } from 'inversify';
import { ShoppingBasketService } from '../../ShoppingBasket/domain/ShoppingBasketService';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ShoppingBasket,ShoppingBasketitems } from '../../ShoppingBasket/domain/ShoppingBasket';
import { ObjectId } from 'mongodb';

@injectable()
export class ShoppingBasketApplicationService {
    constructor(private shoppingListService: ShoppingBasketService) {}

    async createShoppingBasket(userId: ObjectId, items: ShoppingBasketitems[]): Promise<ApiResponse<any>> {
        const createdbasket= await this.shoppingListService.createShoppingBasket(userId, items);
        if(createdbasket){
            return new ApiResponse(0, 'Shopping Basket Added Product', createdbasket);
        } else {
            return new ApiResponse(1, 'Failed to Added Product', null);
    }
}
}