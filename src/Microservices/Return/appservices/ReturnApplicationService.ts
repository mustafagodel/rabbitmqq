import { injectable } from 'inversify';
import { ReturnService } from '../domain/Return/ReturnService';
import { ApiResponse } from '../../../infrastructure/ApiResponse';
import { Returnitems } from '../domain/Return/Return';
import { IReturnData } from '../dto/Response/interfaces';

@injectable()
export class ReturnApplicationService {
    constructor(private returnService: ReturnService) { }
    [key: string]: any;
    async createReturn(returndata:IReturnData): Promise<ApiResponse<any>> {
        const createdReturn = await this.returnService.createReturn(returndata);

        if (createdReturn) {
            return new ApiResponse(0, 'Return Request Received', createdReturn);
        } else {
            return new ApiResponse(1, 'Failed to create return', null);
        }
    }
}
