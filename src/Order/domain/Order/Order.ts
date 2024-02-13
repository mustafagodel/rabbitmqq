import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

@injectable()
export class Order {
    id: ObjectId | undefined;

    constructor(
        public orderId: ObjectId,
        public items: OrderItem[],
        public totalPrice: number
    ) { }
}

export class OrderItem {
    constructor(public productname: string, public quantity: number, public ıd: ObjectId) { }
}