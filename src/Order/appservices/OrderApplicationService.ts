import { injectable } from 'inversify';
import { OrderService } from '../domain/Order/OrderService';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { IOrderData } from '../dto/Response/interfaces';


@injectable()
export class OrderApplicationService {
    [key: string]: any;
    constructor(private orderService: OrderService) { }

    async createOrder(orderdata:IOrderData): Promise<ApiResponse<any>> {
        const createdOrder = await this.orderService.createOrder(orderdata);

        if (createdOrder) {
            return new ApiResponse(0, 'Order created successfully', createdOrder);
        }
        return new ApiResponse(1, 'Failed to create order', null);

    }

    async updateOrder(orderdata:IOrderData): Promise<ApiResponse<any>> {
        const updatedOrder = await this.orderService.updateOrder(orderdata);

        if (updatedOrder) {
            return new ApiResponse(0, 'Order updated successfully', updatedOrder);
        }
        return new ApiResponse(1, 'Failed to update order', null);

    }

    async deleteOrder(orderdata:IOrderData): Promise<ApiResponse<any>> {
        const result = await this.orderService.deleteOrder(orderdata);

        if (result) {
            return new ApiResponse(0, 'Order deleted successfully', true);
        }
        return new ApiResponse(1, 'Failed to delete order', false);

    }

    async getOrderById(orderdata:IOrderData): Promise<ApiResponse<any>> {
        const order = await this.orderService.getOrderById(orderdata);

        if (order) {
            return new ApiResponse(0, 'Order retrieved successfully', order);
        }
        return new ApiResponse(1, 'Order not found', null);

    }

    async getAllOrders(): Promise<ApiResponse<any>> {
        const orders = await this.orderService.getAllOrders();

        if (orders.length > 0) {
            return new ApiResponse(0, 'Orders retrieved successfully', orders);
        }
        return new ApiResponse(1, 'No orders found', []);

    }
}
