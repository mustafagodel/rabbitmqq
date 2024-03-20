
import { inject, injectable } from 'inversify';
import { DeliveryAddress, InvoiceDetail, Order, OrderItem } from './Order';
import { OrderRepository } from './OrderRepository';
import { ObjectId } from 'mongodb';
import { IOrderData } from '../../dto/Response/interfaces';

@injectable()
export class OrderService {
    constructor(@inject(OrderRepository) public orderRepository: OrderRepository) {

    }

    async createOrder(orderdata:IOrderData): Promise<Order | undefined> {
        const order = new Order(orderdata.orderId,orderdata.items, orderdata.price,orderdata.Invoicedetail,orderdata.deliveryAddress);
        const result = await this.orderRepository.add(order);

        if (result) {

            return order;
        }

        return undefined;
    }

    async updateOrder(orderdata: IOrderData): Promise<Order | undefined> {
        const order = new Order(orderdata.orderId, orderdata.items, orderdata.price,orderdata.Invoicedetail,orderdata.deliveryAddress);
        const result = await this.orderRepository.update(orderdata.orderId, order);

        if (result.success) {

            return order;
        }

        return undefined;
    }

    async deleteOrder(orderdata: IOrderData): Promise<boolean> {
        const result = await this.orderRepository.delete(orderdata.orderId);

        if (result) {

            return true;
        }

        return false;
    }

    async getOrderById(orderdata: IOrderData): Promise<Order | undefined> {
        return this.orderRepository.findById(orderdata.orderId);
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.findAll();
    }
}
