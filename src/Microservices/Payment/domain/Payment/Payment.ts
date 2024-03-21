

import { injectable } from "inversify";
import { ObjectId } from "mongodb";

@injectable()
export class Payment {
    id: ObjectId | undefined;
    constructor(
        public amount: number,
        public userId:ObjectId
    ) { }
}
