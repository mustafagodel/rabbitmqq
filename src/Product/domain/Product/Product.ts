import { injectable } from 'inversify';

@injectable()
export class Product {
    id: string | undefined;

    constructor(public type:string ,public name: string, public price: number, public stock: number) {}
}
