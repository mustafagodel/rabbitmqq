

import { Container } from 'inversify';
import { MongoDBConnector } from './db';

import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';

import { Order } from './domain/Order/Order';
import { OrderRepository } from './domain/Order/OrderRepository';
import { OrderService } from './domain/Order/OrderService';
import { OrderApplicationService } from './appservices/OrderApplicationService';
import { OrderApp } from './app/app';




const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();
  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();
  container.bind<Order>(Order).to(Order).inRequestScope();
  container.bind<OrderRepository>(OrderRepository).to(OrderRepository).inRequestScope();
  container.bind<OrderService>(OrderService).to(OrderService).inRequestScope();
  container.bind<OrderApplicationService>(OrderApplicationService).to(OrderApplicationService).inRequestScope();
  container.bind<OrderApp>(OrderApp).to(OrderApp).inRequestScope();
};

export default configureContainer;
