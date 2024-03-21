import { injectable } from "inversify";
import { ObjectId } from "mongodb";



@injectable()
export class ShoppingBasket {


    constructor(
        public userId: ObjectId,
        public items: ShoppingBasketitems[],
        public totalPrice: number,
        public Invoicedetail:InvoiceDetail[],
        public deliveryAddress:DeliveryAddress[]
    ) { }
}

export class ShoppingBasketitems {
    constructor(public productName: string, public quantity: number, public ıd: ObjectId) { }
}
export class InvoiceDetail { 
    constructor(public address: string, public phone: string, public email: string,  public paymentMethod: string, public date: Date) { 

    }
}
export class DeliveryAddress { 
    constructor(public address: string, public phone: string) { 
    }
}

