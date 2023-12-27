import { injectable } from 'inversify';

@injectable()
export class Return {
    returnReason: string | undefined;
    isDefective: boolean = false;
    returnDate: Date | undefined;


    constructor( public items: Returnitems[], returnReason?: string, isDefective?: boolean) {
        this.returnReason = returnReason;
        this.isDefective = isDefective || false;
        this.returnDate = new Date(); 
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
