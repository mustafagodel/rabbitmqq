
import { inject, injectable } from 'inversify';
import { DeliveryAddress, InvoiceDetail, Order, OrderItem } from './Order';
import { OrderRepository } from './OrderRepository';
import { ObjectId } from 'mongodb';

@injectable()
export class OrderService {
    private orders: Order[] = [];
    constructor(@inject(OrderRepository) public orderRepository: OrderRepository) {

    }

    async createOrder(orderId: ObjectId, items: OrderItem[], price: number,Invoicedetail:InvoiceDetail[],deliveryAddress:DeliveryAddress[]): Promise<Order | undefined> {
        const order = new Order(orderId, items, price,Invoicedetail,deliveryAddress);
        const result = await this.orderRepository.add(order);

        if (result) {

            return order;
        }

        return undefined;
    }

    async updateOrder(id: ObjectId, orderId: ObjectId, items: OrderItem[], price: number,Invoicedetail:InvoiceDetail[],deliveryAddress:DeliveryAddress[]): Promise<Order | undefined> {
        const order = new Order(orderId, items, price,Invoicedetail,deliveryAddress);
        const result = await this.orderRepository.update(id, order);

        if (result.success) {

            return order;
        }

        return undefined;
    }

    async deleteOrder(id: ObjectId): Promise<boolean> {
        const result = await this.orderRepository.delete(id);

        if (result) {

            return true;
        }

        return false;
    }

    async getOrderById(id: ObjectId): Promise<Order | undefined> {
        return this.orderRepository.findById(id);
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.findAll();
    }
}
