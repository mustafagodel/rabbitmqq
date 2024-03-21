import { inject, injectable } from 'inversify';
import { OrderService } from '../domain/Order/OrderService';
import { ApiResponse } from '../../../infrastructure/ApiResponse';
import { ICreateOrder, IDeleteOrder, IGetOrderById, IUpdateOrder } from '../dto/Response/interfaces';




@injectable()
export class OrderApplicationService {
    [key: string]: any;
    constructor(@inject(OrderService) private orderService: OrderService) { }

    async createOrder(createOrder:ICreateOrder): Promise<ApiResponse<any>> {
        const createdOrder = await this.orderService.createOrder(createOrder.orderId,createOrder.items,createOrder.totalPrice,createOrder.Invoicedetail,createOrder.deliveryAddress);

        if (createdOrder) {
            return new ApiResponse(0, 'Order created successfully', createdOrder);
        }
        return new ApiResponse(1, 'Failed to create order', null);

    }

    async updateOrder(updateOrder:IUpdateOrder): Promise<ApiResponse<any>> {
        const updatedOrder = await this.orderService.updateOrder(updateOrder.orderId,updateOrder.items,updateOrder.totalPrice,updateOrder.Invoicedetail,updateOrder.deliveryAddress);

        if (updatedOrder) {
            return new ApiResponse(0, 'Order updated successfully', updatedOrder);
        }
        return new ApiResponse(1, 'Failed to update order', null);

    }

    async deleteOrder(deleteOrder:IDeleteOrder): Promise<ApiResponse<any>> {
        const result = await this.orderService.deleteOrder(deleteOrder.orderId);

        if (result) {
            return new ApiResponse(0, 'Order deleted successfully', true);
        }
        return new ApiResponse(1, 'Failed to delete order', false);

    }

    async getOrderById(getOrderById:IGetOrderById): Promise<ApiResponse<any>> {
        const order = await this.orderService.getOrderById(getOrderById.orderId);

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
