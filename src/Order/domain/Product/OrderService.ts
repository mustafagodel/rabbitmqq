
import { inject, injectable } from 'inversify';
import { Order, OrderItem } from './Order';
import { OrderRepository } from './OrderRepository';

@injectable()
export class OrderService {
    private orders: Order[] = [];
    constructor(@inject(OrderRepository) public orderRepository: OrderRepository) {
    
    }

    async createOrder(orderId: string, items: OrderItem[], price: number): Promise<Order | undefined> {
        const order = new Order(orderId, items, price);
        const result = await this.orderRepository.add(order);

        if (result) {
           
            return order;
        }

        return undefined;
    }

    async updateOrder(id: string, orderId: string, items: OrderItem[], price: number): Promise<Order | undefined> {
        const order = new Order(orderId, items, price);
        const result = await this.orderRepository.update(id, order);

        if (result.success) {
      
            return order;
        }

        return undefined;
    }

    async deleteOrder(id: string): Promise<boolean> {
        const result = await this.orderRepository.delete(id);

        if (result) {
          
            return true;
        }

        return false;
    }

    async getOrderById(id: string): Promise<Order | undefined> {
        return this.orderRepository.findById(id);
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.findAll();
    }
}
