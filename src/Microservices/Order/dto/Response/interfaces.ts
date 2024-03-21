
import { ObjectId } from 'mongodb';
import { BaseRequest } from '../../../../infrastructure/BaseRequset'

export interface ICreateOrder extends BaseRequest{
    orderId: ObjectId;
    items: { productname: string; quantity: number; ıd: ObjectId }[];
    totalPrice: number;
    Invoicedetail: any[];
    deliveryAddress: any[];
}
export interface IUpdateOrder extends BaseRequest{
    orderId: ObjectId;
    items: { productname: string; quantity: number; ıd: ObjectId }[];
    totalPrice: number;
    Invoicedetail: any[];
    deliveryAddress: any[];

}
export interface IDeleteOrder extends BaseRequest{
    
    orderId: ObjectId;
}
export interface IGetOrderById extends BaseRequest{
    
    orderId: ObjectId;
}