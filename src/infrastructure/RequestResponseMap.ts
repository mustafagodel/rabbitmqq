import { RabbitMQService } from './RabbitMQService';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestResponseMap {
  private requestMap: Record<string, RabbitMQService> = {};

  constructor(
    @inject('UserRabbitMQServiceQueue') UserrabbitmqService: RabbitMQService,
    @inject('ProductRabbitMQServiceQueue') ProductrabbitmqService: RabbitMQService,
    @inject('OrderRabbitMQServiceQueue') OrderrabbitmqService: RabbitMQService
  ) {
    this.requestMap = {
      'login': UserrabbitmqService,
      'register': UserrabbitmqService,
      'create': ProductrabbitmqService,
      'get': ProductrabbitmqService,
      'delete': ProductrabbitmqService,
      'getAll': ProductrabbitmqService,
      'update': ProductrabbitmqService,
      'createOrder':OrderrabbitmqService,
      'updateOrder':OrderrabbitmqService,
      'deleteOrder':OrderrabbitmqService,
      'getOrder':OrderrabbitmqService,
      'getAllOrders':OrderrabbitmqService,
      'getname':OrderrabbitmqService,
      'checkAndDecreaseStock':ProductrabbitmqService
    };
  }


  requiresToken(action: string): boolean {
    return action !== 'login' && action !== 'register';
  }

  getRequestService(action: string): RabbitMQService | undefined {
    return this.requestMap[action];
  }
}
