
import { ObjectId } from 'mongodb';
import { BaseRequest } from '../../../../infrastructure/BaseRequset'

export interface ICreateProduct extends BaseRequest{
    name: string;
    type: string;
    price: number;
    stock: number;
    id: string;
    items: any[]; 
    productName:string;

}
export interface IcheckAndDecreaseStockData extends BaseRequest {
    name: string;
    type: string;
    price: number;
    stock: number;
    id: string;
    items: any[]; 
    productName:string;

}
export interface IUpdateProduct extends BaseRequest {
    id: string;
    type: string;
    name: string;
    price: number;
    stock: number;
}

export interface IDeleteProduct extends BaseRequest {
    id: string;
   
}
export interface IGetProductById extends BaseRequest {
    id: string;
   
}
export interface IGetProductByName extends BaseRequest {
    name: string;
   
}
