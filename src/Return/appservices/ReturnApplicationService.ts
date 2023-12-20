import { injectable } from 'inversify';
import { ReturnService } from '../domain/Return/ReturnService';
import { ApiResponse } from '../../infrastructure/ApiResponse';

@injectable()
export class ReturnApplicationService {
    constructor(private returnService: ReturnService) {}

    async createReturn( returnReason: string, isDefective: boolean, returnDate: Date, items: any[]): Promise<ApiResponse<any>> {
        const createdReturn = await this.returnService.createReturn( returnReason, isDefective, returnDate, items);

        if (createdReturn) {
            return new ApiResponse(0, 'Return created successfully', createdReturn);
        } else {
            return new ApiResponse(1, 'Failed to create return', null);
        }
    }
}
