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

    setReturnDate(returnDate: Date): void {
        this.returnDate = returnDate;
    }
    getFormattedReturnDate(): string {
        if (this.returnDate) {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            };
            return this.returnDate.toLocaleString('tr-TR', options);
        }
        return '';
    }
}

export class Returnitems {
    constructor(public productname: string, public quantity: number) {}
}
