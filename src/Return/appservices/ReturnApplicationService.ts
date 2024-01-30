import { injectable } from 'inversify';
import { ReturnService } from '../domain/Return/ReturnService';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { Returnitems } from '../domain/Return/Return';

@injectable()
export class ReturnApplicationService {
    constructor(private returnService: ReturnService) {}

    async createReturn( returnReason: string,items: Returnitems[]): Promise<ApiResponse<any>> {
        const createdReturn = await this.returnService.createReturn( returnReason,items);

        if (createdReturn) {
            return new ApiResponse(0, 'Return Request Received', createdReturn);
        } else {
            return new ApiResponse(1, 'Failed to create return', null);
        }
    }
}
