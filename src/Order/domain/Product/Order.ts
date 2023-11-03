import { injectable } from 'inversify';

@injectable()
export class Order {
    id: string | undefined;

    constructor(
        public orderId: string, 
        public items: OrderItem[], 
        public totalPrice: number 
    ) {}
}

export class OrderItem {
    constructor(public productname: string, public quantity: number) {}
}