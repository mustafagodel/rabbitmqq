
import { BaseRequest } from '../../../../infrastructure/BaseRequset'

export interface IReturnData extends BaseRequest{
    returnReason: string;
    returnItems: any[];
}
