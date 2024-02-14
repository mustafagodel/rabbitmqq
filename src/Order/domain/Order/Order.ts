import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

@injectable()
export class Order {
    id: ObjectId | undefined;

    constructor(
        public orderId: ObjectId,
        public items: OrderItem[],
        public totalPrice: number,
        public Invoicedetail:InvoiceDetail[]
    ) { }
}

export class OrderItem {
    constructor(public productname: string, public quantity: number, public ıd: ObjectId) { }
}


export class InvoiceDetail { 
    constructor(public address: string, public phone: string, public email: string,  public paymentMethod: string, public date: Date) { 
    }
}
