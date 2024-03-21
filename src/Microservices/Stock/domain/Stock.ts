import { ObjectId } from 'mongodb';

export class Stock {
    id: ObjectId | undefined;
    constructor(
        public productId: ObjectId, 
        public quantity: number, 
        public operation: 'increase stok' | 'decrease stok' | 'update stok' | 'rollback stok',
    ) {}
}
