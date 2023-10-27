// RequestResponseMap.ts
import { RabbitMQService } from './RabbitMQService';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestResponseMap {
  private requestMap: Record<string, RabbitMQService> = {};
  private responseMap: Record<string, string[]> = {};
  constructor(
    @inject('RabbitMQServiceQueue1') rabbitmqService: RabbitMQService,
    @inject('RabbitMQServiceQueue2') rabbitmqService2: RabbitMQService
  ) {
   
    this.requestMap = {
      'login': rabbitmqService,
      'register': rabbitmqService,
      'create': rabbitmqService2,
      'get': rabbitmqService2,
      'delete': rabbitmqService2,
      'getAll': rabbitmqService2,
      'update': rabbitmqService2,
    };

    this.responseMap = {
      'login': ['login_response'],
      'register': ['register_response'],
      'create': ['create_response'],
      'get': ['get_response'],
      'delete': ['delete_response'],
      'getAll': ['getAll_response'],
      'update': ['update_response'],
    };
  }

  getRequestService(action: string): RabbitMQService | undefined {
    return this.requestMap[action];
  }

  getResponseActions(action: string): string[] {
    return this.responseMap[action] || [];
  }
}
