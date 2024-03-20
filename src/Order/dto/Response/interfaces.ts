
import { ObjectId } from 'mongodb';
import { BaseRequest } from '../../../infrastructure/BaseRequset'

export interface IOrderData extends BaseRequest{
    action: string;
    orderId: ObjectId;
    items: { productname: string; quantity: number; ıd: ObjectId }[];
    totalPrice: number;
    Invoicedetail: any[];
    deliveryAddress: any[];
    [key: string]: any;
}