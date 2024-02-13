import { injectable } from "inversify";
import { ObjectId } from "mongodb";



@injectable()
export class ShoppingBasket {


    constructor(
        public userId: ObjectId,
        public items: ShoppingBasketitems[],

    ) { }
}

export class ShoppingBasketitems {
    constructor(public productName: string, public quantity: number, public ıd: ObjectId) { }
}