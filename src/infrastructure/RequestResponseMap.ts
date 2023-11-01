import { RabbitMQService } from './RabbitMQService';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestResponseMap {
  private requestMap: Record<string, RabbitMQService> = {};

  constructor(
    @inject('UserRabbitMQServiceQueue') UserrabbitmqService: RabbitMQService,
    @inject('ProductRabbitMQServiceQueue') ProductrabbitmqService2: RabbitMQService
  ) {
    this.requestMap = {
      'login': UserrabbitmqService,
      'register': UserrabbitmqService,
      'create': ProductrabbitmqService2,
      'get': ProductrabbitmqService2,
      'delete': ProductrabbitmqService2,
      'getAll': ProductrabbitmqService2,
      'update': ProductrabbitmqService2,
    };
  }


  requiresToken(action: string): boolean {
    return action !== 'login' && action !== 'register';
  }

  getRequestService(action: string): RabbitMQService | undefined {
    return this.requestMap[action];
  }
}
