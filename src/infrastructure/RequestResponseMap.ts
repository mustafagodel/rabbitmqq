import { RabbitMQProvider } from './RabbitMQProvider';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestResponseMap {
  private requestMap: Record<string, RabbitMQProvider> = {};

  constructor(
    @inject('UserRabbitMQProviderQueue') userRabbitMQProviderQueue: RabbitMQProvider,
    @inject('ProductRabbitMQProviderQueue') productRabbitMQProviderQueue: RabbitMQProvider,
    @inject('OrderRabbitMQProviderQueue') orderRabbitMQProviderQueue: RabbitMQProvider,
    @inject('AggregatorRabbitMQProviderQueue') aggregatorRabbitMQProviderQueue: RabbitMQProvider,
    @inject('ReturnRabbitMQProviderQueue') returnRabbitMQProviderQueue: RabbitMQProvider,
    @inject('ApiGateWayRabbitMQProviderQueue') apiGateWayRabbitMQProviderQueue: RabbitMQProvider,
    @inject('ShoppingBasketRabbitMQProviderQueue') shoppingBasketRabbitMQProviderQueue: RabbitMQProvider,
    @inject('PaymentRabbitMQProviderQueue') paymentRabbitMQProviderQueue: RabbitMQProvider,
  ) {
    this.requestMap = {
      'login': userRabbitMQProviderQueue,
      'register': userRabbitMQProviderQueue,
      'createProduct': productRabbitMQProviderQueue,
      'getProduct': productRabbitMQProviderQueue,
      'deleteProduct': productRabbitMQProviderQueue,
      'getAllProduct': productRabbitMQProviderQueue,
      'updateProduct': productRabbitMQProviderQueue,
      'createOrder': orderRabbitMQProviderQueue,
      'updateOrder': orderRabbitMQProviderQueue,
      'deleteOrder': orderRabbitMQProviderQueue,
      'getOrder': orderRabbitMQProviderQueue,
      'getAllOrders': orderRabbitMQProviderQueue,
      'getname': orderRabbitMQProviderQueue,
      'checkAndDecreaseStock': productRabbitMQProviderQueue,
      'handleMessageAction': aggregatorRabbitMQProviderQueue,
      'response': aggregatorRabbitMQProviderQueue,
      'apiGateWay': apiGateWayRabbitMQProviderQueue,
      'createReturn': returnRabbitMQProviderQueue,
      'checkReturn,': returnRabbitMQProviderQueue,
      'addShoppingBasket': shoppingBasketRabbitMQProviderQueue,
      'completeShoppingBasket': shoppingBasketRabbitMQProviderQueue,
      'processPayment': paymentRabbitMQProviderQueue,
      'handleMessage' : paymentRabbitMQProviderQueue
    };
  }


  requiresToken(action: string): boolean {
    return action !== 'login' && action !== 'register';
  }

  requiresCustomerRole(action: string, userRole: string): boolean {
    const CustomerRequiredActions = ['createOrder', 'updateOrder', 'deleteOrder', 'handleMessageAction', 'getOrder', 'getAllOrders', 'createReturn', 'checkReturn', 'addShoppingBasket','processPayment','completeShoppingBasket'];
    return CustomerRequiredActions.includes(action) && userRole !== 'customer';
  }
  getRequestService(action: string): RabbitMQProvider | undefined {
    return this.requestMap[action];
  }
}
