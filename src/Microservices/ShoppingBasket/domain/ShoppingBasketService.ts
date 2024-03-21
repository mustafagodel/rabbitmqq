
import { inject, injectable } from 'inversify';
import { ShoppingBasketRepository } from './ShoppingBasketRepository';
import { DeliveryAddress, InvoiceDetail, ShoppingBasket, ShoppingBasketitems } from './ShoppingBasket';
import { ObjectId } from 'mongodb';
import { ICompleteShoppingBasket, IGetUserShoppingBasket, IcreateShoppingBasket } from '../dto/Response/interfaces';



@injectable()
export class ShoppingBasketService {
    constructor(
        @inject(ShoppingBasketRepository) private shoppingBasketRepository: ShoppingBasketRepository,

    ) { }

    async createShoppingBasket(createShoppingBasket:IcreateShoppingBasket): Promise<ShoppingBasket | undefined> {
        const shoppingBasket = new ShoppingBasket(createShoppingBasket.userId,createShoppingBasket.items,createShoppingBasket.price,createShoppingBasket.invoiceDetails,createShoppingBasket.deliveryAddress);
        const result = await this.shoppingBasketRepository.add(shoppingBasket);
        if (result.success) {
            return shoppingBasket;
        }
        return undefined;
    }

    async getUserShoppingBasket(userId: IGetUserShoppingBasket): Promise<ShoppingBasket | undefined> {
        return this.shoppingBasketRepository.findById(userId.userId);
    }

    async completeShoppingBasket(completeShoppingBasket:ICompleteShoppingBasket): Promise<any> {
        try {
            const shoppingBasket = await this.getUserShoppingBasket(completeShoppingBasket);
            if (!shoppingBasket) {
                throw new Error('Shopping basket not found for the user.');
            }
            if (shoppingBasket) {
                return shoppingBasket;
            }
            
            await this.shoppingBasketRepository.delete(completeShoppingBasket.userId);
        } catch (error) {
            console.error('Error completing shopping basket:', error);
            throw new Error('Error completing shopping basket');
        }
    }
}
