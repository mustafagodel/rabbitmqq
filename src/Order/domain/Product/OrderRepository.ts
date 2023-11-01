
import { injectable } from 'inversify';
import { Order } from './Order';

@injectable()
export class OrderRepository {
    private orders: Order[] = [];

    async add(order: Order): Promise<boolean> {
        this.orders.push(order);
        return true;
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
