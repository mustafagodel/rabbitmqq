import { inject, injectable } from 'inversify';

@injectable()
export class Order {
    id: string | undefined;

    constructor(public orderId: string, public items: string[], public price: number) {}
}