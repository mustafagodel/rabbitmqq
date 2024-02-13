import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

@injectable()
export class Product {
    id: ObjectId | undefined;

    constructor(public type: string, public name: string, public price: number, public stock: number) { }
}
