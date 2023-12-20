import { inject, injectable } from 'inversify';
import { ReturnRepository } from './ReturnRepository';
import { Return } from './Return';

@injectable()
export class ReturnService {
    constructor(@inject(ReturnRepository) private returnRepository: ReturnRepository) {}

    async createReturn( returnReason: string, isDefective: boolean, returnDate: Date, items: any[]): Promise<Return | undefined> {
        const newReturn = new Return(items);
    
        newReturn.setReturnReason(returnReason);
        if (isDefective) {
            newReturn.markAsDefective();
        }
        newReturn.setReturnDate(returnDate);


        const result = await this.returnRepository.add(newReturn);

        if (result.success) {
            return newReturn;
        }

        return undefined;
    }
}
