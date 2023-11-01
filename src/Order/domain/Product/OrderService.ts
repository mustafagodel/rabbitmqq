
import { injectable } from 'inversify';
import { Order } from './Order';

@injectable()
export class OrderService {
    private orders: Order[] = [];

    async createOrder(orderId: number, items: string[], price: number): Promise<Order> {
        const order = new Order(orderId, items, price);
        this.orders.push(order);
        return order;
    }

    async updateOrder(id: string, orderId: number, items: string[], price: number): Promise<Order | undefined> {
        const existingOrder = this.orders.find((order) => order.id === id);
        if (existingOrder) {

            existingOrder.orderId = orderId;
            existingOrder.items = items;
            existingOrder.price = price;
            return existingOrder;
        }
        return undefined;
    }

    async deleteOrder(id: string): Promise<boolean> {
        const index = this.orders.findIndex((order) => order.id === id);
        if (index !== -1) {
            this.orders.splice(index, 1);
            return true;
        }
        return false;
    }

    async getOrderById(id: string): Promise<Order | undefined> {
        return this.orders.find((order) => order.id === id);
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orders;
    }
}
