
import { inject, injectable } from 'inversify';
import { Order } from './Order';
import { Collection, ObjectId } from 'mongodb';
import { MongoDBConnector } from '../../../infrastructure/db';
import { ProductRepository } from '../../../Product/domain/Product/ProductRepository';

@injectable()
export class OrderRepository {
    private orders: Order[] = [];
    private collection: Collection | undefined;

    constructor(
        @inject(MongoDBConnector) private databaseConnector: MongoDBConnector,
        @inject(ProductRepository) private productRepository: ProductRepository
    ) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('orders');
    }

    async add(order: Order): Promise<{ success: boolean }> {
        try {
            const result = await this.collection!.insertOne(order);
            if (result.acknowledged) {
                return { success: true };
            } else {
                console.error('The insertion operation failed:', result.acknowledged);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB insertion error:', error);
            return { success: false };
        }
    }

    async update(id:string,order: Order):  Promise<{ success: boolean }>{

        try {
            const result = await this.collection!.updateOne({ _id: new ObjectId(id) }, { $set: order });
            if (result.modifiedCount && result.modifiedCount > 0) {
                return { success: true };
            } else {
                console.error('The update process failed:', result);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB update error:', error);
            return { success: false };
        }
    }

    async delete(id: string):  Promise<{ success: boolean }>{
        try {
            const result = await this.collection!.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount && result.deletedCount > 0) {
                return { success: true };
            } else {
                console.error('The deletion process failed:', result);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB deletion error:', error);
            return { success: false };
        }
    }

    async findById(id: string): Promise<Order | undefined> {
        if (!this.collection) {
            return undefined;
        }

        try {
            const OrderDoc = await this.collection.findOne({ _id: new ObjectId(id) });

            if (!OrderDoc) {
                return undefined;
            }
            const order = new Order(OrderDoc.orderId, OrderDoc.items, OrderDoc.price);
            order.id = OrderDoc._id.toString();

            return order;
        } catch (error) {
            console.error('MongoDB Query error:', error);
            throw error;
        }
    }

    async findAll(): Promise<Order[]> {
        if (!this.collection) {
            return [];
        }

        try {
            const OrderDoc = await this.collection.find({}).toArray();
            const order: Order[] = OrderDoc.map((OrderDoc) => {
                const order = new Order(OrderDoc.orderId, OrderDoc.items, OrderDoc.price);
                order.id = OrderDoc._id.toString();
                return order;
            });

            return order;
        } catch (error) {
            console.error('MongoDB Query error:', error);
            throw error;
        }
    }
}
