import { inject, injectable } from 'inversify';
import { ReturnRepository } from './ReturnRepository';
import { Return, Returnitems } from './Return';

@injectable()
export class ReturnService {
    constructor(@inject(ReturnRepository) private returnRepository: ReturnRepository) {}

    async createReturn( returnReason: string, isDefective: boolean, returnDate: Date, items: Returnitems[]): Promise<Return | undefined> {
        const newReturn = new Return(items,returnReason,isDefective,returnDate);


        const result = await this.returnRepository.add(newReturn);

        if (result.success) {
            return newReturn;
        }

        return undefined;
    }
}
