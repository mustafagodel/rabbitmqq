import { injectable } from 'inversify';
import { OrderService } from '../../Order/domain/Product/OrderService';
import { ApiResponse } from '../../infrastructure/ApiResponse';

@injectable()
export class OrderApplicationService {
    constructor(private orderService: OrderService) {}

    async createOrder(orderId: string, items: string[], price: number): Promise<ApiResponse<any>> {
        const createdOrder = await this.orderService.createOrder(orderId, items, price);

        if (createdOrder) {
            return new ApiResponse(0, 'Order created successfully', createdOrder);
        } else {
            return new ApiResponse(1, 'Failed to create order', null);
        }
    }

    async updateOrder(id: string, orderId: string, items: string[], price: number): Promise<ApiResponse<any>> {
        const updatedOrder = await this.orderService.updateOrder(id, orderId, items, price);

        if (updatedOrder) {
            return new ApiResponse(0, 'Order updated successfully', updatedOrder);
        } else {
            return new ApiResponse(1, 'Failed to update order', null);
        }
    }

    async deleteOrder(id: string): Promise<ApiResponse<any>> {
        const result = await this.orderService.deleteOrder(id);

        if (result) {
            return new ApiResponse(0, 'Order deleted successfully', true);
        } else {
            return new ApiResponse(1, 'Failed to delete order', false);
        }
    }

    async getOrderById(id: string): Promise<ApiResponse<any>> {
        const order = await this.orderService.getOrderById(id);

        if (order) {
            return new ApiResponse(0, 'Order retrieved successfully', order);
        } else {
            return new ApiResponse(1, 'Order not found', null);
        }
    }

    async getAllOrders(): Promise<ApiResponse<any>> {
        const orders = await this.orderService.getAllOrders();

        if (orders.length > 0) {
            return new ApiResponse(0, 'Orders retrieved successfully', orders);
        } else {
            return new ApiResponse(1, 'No orders found', []);
        }
    }
}
