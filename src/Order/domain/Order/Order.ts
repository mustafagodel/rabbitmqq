import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

@injectable()
export class Order {
    id: ObjectId | undefined;

    constructor(
        public orderId: ObjectId,
        public items: OrderItem[],
        public totalPrice: number,
        public Invoicedetail:InvoiceDetail[],
        public deliveryAddress:DeliveryAddress[]
    ) { }
}

export class OrderItem {
    constructor(public productname: string, public quantity: number, public ıd: ObjectId) { }
}


export class InvoiceDetail {
    public date: Date;

    constructor(
        public address: string, 
        public phone: string, 
        public email: string,  
        public paymentMethod: string
    ) {
        this.date = new Date(); 
    }

}
export class DeliveryAddress { 
    constructor(public address: string, public phone: string) { 
    }
    
}
