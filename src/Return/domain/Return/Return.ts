import { injectable } from 'inversify';

@injectable()
export class Return {
    returnReason: string | undefined;
    isDefective: boolean = false;
    returnDate: Date | undefined;


    constructor( public items: Returnitems[], returnReason?: string, isDefective?: boolean, returnDate?: Date) {
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
export class Returnitems {
    constructor(public productname: string, public quantity: number) {}
}
