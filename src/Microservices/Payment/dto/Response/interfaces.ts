
import { ObjectId } from 'mongodb';
import { BaseRequest } from '../../../../infrastructure/BaseRequset'


export interface IPaymentData extends BaseRequest {
    action: string;
    price: number;
    userId:ObjectId;

}
