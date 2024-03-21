
import { ObjectId } from 'mongodb';
import { BaseRequest } from '../../../../infrastructure/BaseRequset'

export interface IcreateShoppingBasket extends BaseRequest{  
    userId: ObjectId;
    items: any[];
    price: number;
    invoiceDetails: any[];
    deliveryAddress: any[];
}
export interface IGetUserShoppingBasket extends BaseRequest{  
    userId: ObjectId;
}
export interface ICompleteShoppingBasket extends BaseRequest{  
    userId: ObjectId;
}