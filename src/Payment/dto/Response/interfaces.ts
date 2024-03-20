
import { BaseRequest } from '../../../infrastructure/BaseRequset'


export interface IMessageData extends BaseRequest {
    action: string;

    amount: number;

}
