
import { inject, injectable } from 'inversify';
import { DeliveryAddress, InvoiceDetail, Order, OrderItem } from './Order';
import { OrderRepository } from './OrderRepository';

import { ICreateOrder, IDeleteOrder, IGetOrderById, IUpdateOrder } from '../../dto/Response/interfaces';
import { ObjectId } from 'mongodb';




@injectable()
export class OrderService {
    constructor(@inject(OrderRepository) public orderRepository: OrderRepository) {

    }
    

    async createOrder(orderId: ObjectId, items: OrderItem[], price: number,Invoicedetail:InvoiceDetail[],deliveryAddress:DeliveryAddress[]): Promise<Order | undefined> {
        const order = new Order(orderId,items,price,Invoicedetail,deliveryAddress);
        const result = await this.orderRepository.add(order);

        if (result) {

            return order;
        }

        return undefined;
    }

    async updateOrder(orderId: ObjectId, items: OrderItem[], price: number,Invoicedetail:InvoiceDetail[],deliveryAddress:DeliveryAddress[]): Promise<Order | undefined> {
        const order = new Order(orderId, items, price,Invoicedetail,deliveryAddress);
        const result = await this.orderRepository.update(orderId, order);

        if (result.success) {

            return order;
        }

        return undefined;
    }

    async deleteOrder(orderId: ObjectId): Promise<boolean> {
        const result = await this.orderRepository.delete(orderId);

        if (result) {

            return true;
        }

        return false;
    }

    async getOrderById(orderId: ObjectId): Promise<Order | undefined> {
        return this.orderRepository.findById(orderId);
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.findAll();
    }
}
