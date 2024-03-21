import { inject, injectable } from 'inversify';
import { ShoppingBasketService } from '../domain/ShoppingBasketService';
import { ApiResponse } from '../../../infrastructure/ApiResponse';
import { ICompleteShoppingBasket, IGetUserShoppingBasket, IcreateShoppingBasket } from '../dto/Response/interfaces'

@injectable()
export class ShoppingBasketApplicationService {
    [key: string]: any;
    constructor(private shoppingListService: ShoppingBasketService) { }

    async createShoppingBasket(createShoppingBasket:IcreateShoppingBasket): Promise<ApiResponse<any>> {
        const createdbasket = await this.shoppingListService.createShoppingBasket(createShoppingBasket);
        if (createdbasket) {
            return new ApiResponse(0, 'Shopping Basket Added Product', createdbasket);
        } else {
            return new ApiResponse(1, 'Failed to Added Product', null);
        }
    }
    async getUserShoppingBasket(getUserShoppingBasket: IGetUserShoppingBasket): Promise<ApiResponse<any>> {
        const ShoppingBasket = await this.shoppingListService.getUserShoppingBasket(getUserShoppingBasket);

        if (ShoppingBasket) {
            return new ApiResponse(0, 'Shopping Basket', ShoppingBasket);
        }
        return new ApiResponse(1, 'Shopping Basket not found', null);

    }
    async completeShoppingBasket(completeShoppingBasket:ICompleteShoppingBasket): Promise<ApiResponse<any>> {
        const ShoppingBasket = await this.shoppingListService.completeShoppingBasket(completeShoppingBasket);

        if (ShoppingBasket) {
            return new ApiResponse(0, 'Shopping Basket Successfully Complete ', ShoppingBasket);
        }
        return new ApiResponse(1, 'Shopping Basket not completed', null);

    }
}