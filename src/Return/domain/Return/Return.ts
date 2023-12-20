import { injectable } from 'inversify';

@injectable()
export class Return {
    orderID: string | undefined;
    returnReason: string | undefined;
    isDefective: boolean = false;
    returnDate: Date | undefined;
    returnItems: any[];

    constructor(items: any[], returnReason?: string, isDefective?: boolean, returnDate?: Date) {
        this.returnItems = items;

        this.returnReason = returnReason;
        this.isDefective = isDefective || false;
        this.returnDate = returnDate;
    }

   

    setReturnReason(returnReason: string): void {
        this.returnReason = returnReason;
    }

    markAsDefective(): void {
        this.isDefective = true;
    }

    setReturnDate(returnDate: Date): void {
        this.returnDate = returnDate;
    }
}
