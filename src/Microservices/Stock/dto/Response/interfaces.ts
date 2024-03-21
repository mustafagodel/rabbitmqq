
import { ObjectId } from 'mongodb';
import { BaseRequest } from '../../../../infrastructure/BaseRequset'

export interface IStockMessageData extends BaseRequest{
    _id: string;
    productId: ObjectId;
    Stok: number;
    operation: 'increase stok' | 'decrease stok' | 'update stok' | 'rollback stok';
}