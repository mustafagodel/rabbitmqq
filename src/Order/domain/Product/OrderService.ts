
import { inject, injectable } from 'inversify';
import { Order } from './Order';
import { OrderRepository } from './OrderRepository';

@injectable()
export class OrderService {
    private orders: Order[] = [];
    constructor(@inject(OrderRepository) public OrderRepository: OrderRepository) {
    
    }

    async createOrder(orderId: number, items: string[], price: number): Promise<Order | undefined> {
        const order = new Order(orderId, items, price);
        const result = await this.OrderRepository.add(order);

        if (result) {
           
            return order;
        }

        return undefined;
    }

    async updateOrder(id: string, orderId: number, items: string[], price: number): Promise<Order | undefined> {
        const order = new Order(orderId, items, price);
        const result = await this.OrderRepository.update(id, order);

        if (result.success) {
      
            return order;
        }

        return undefined;
    }

    async deleteOrder(id: string): Promise<boolean> {
        const result = await this.OrderRepository.delete(id);

        if (result) {
          
            return result;
        }

        return false;
    }

    async getOrderById(id: string): Promise<Order | undefined> {
        return this.OrderRepository.findById(id);
    }

    async getAllOrders(): Promise<Order[]> {
        return this.OrderRepository.findAll();
    }
}
