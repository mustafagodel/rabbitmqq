
import { inject, injectable } from 'inversify';
import { Order } from './Order';
import { Collection } from 'mongodb';
import { MongoDBConnector } from '../../../infrastructure/db';
@injectable()
export class OrderRepository {
    private orders: Order[] = [];
    private collection: Collection | undefined;
    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('users'); 
   
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

    async update(order: Order): Promise<boolean> {
        const existingOrder = this.orders.find((o) => o.id === order.id);
        if (existingOrder) {
            existingOrder.orderId = order.orderId;
            existingOrder.items = order.items;
            existingOrder.price = order.price;
            return true;
        }
        return false;
    }

    async delete(id: string): Promise<boolean> {
        const index = this.orders.findIndex((order) => order.id === id);
        if (index !== -1) {
            this.orders.splice(index, 1);
            return true;
        }
        return false;
    }

    async findById(id: string): Promise<Order | undefined> {
        return this.orders.find((order) => order.id === id);
    }

    async findAll(): Promise<Order[]> {
        return this.orders;
    }
}
