import { inject, injectable } from 'inversify';
import { ReturnRepository } from './ReturnRepository';
import { Return } from './Return';
import { IReturnData } from '../../dto/Response/interfaces';

@injectable()
export class ReturnService {
    constructor(@inject(ReturnRepository) private returnRepository: ReturnRepository) { }

    async createReturn(returndata:IReturnData): Promise<Return | undefined> {
        const newReturn = new Return(returndata.returnItems,returndata.returnReason);


        const result = await this.returnRepository.add(newReturn);

        if (result.success) {
            return newReturn;
        }
        return undefined;
    }
}
