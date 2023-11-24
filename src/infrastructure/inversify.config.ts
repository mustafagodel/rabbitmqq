

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../../src/Auth/domain/Users/UserRepository';
import { UserService } from '../Auth/domain/Users/UserService';
import { AuthApp } from '../Auth/app/app.js';
import { UserApplicationService } from '../Auth/appservices/UserApplicationService';
import  PasswordService  from './PasswordService';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService';
import { ProductApp } from '../Product/app/app';
import { Product } from '../Product/domain/Product/Product';
import { ProductRepository } from '../Product/domain/Product/ProductRepository';
import { ProductService } from '../Product/domain/Product/ProductService';
import { RabbitMQService } from '../../src/infrastructure/RabbitMQService';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';  
import { Order } from '../Order/domain/Product/Order';  
import { OrderRepository } from '../Order/domain/Product/OrderRepository';  
import { OrderService } from '../Order/domain/Product/OrderService';  
import { OrderApplicationService } from '../Order/appservices/OrderApplicationService';  
import { OrderApp } from '../Order/app/app';  
import { Aggregator } from '../infrastructure/Aggregator';  


const configureContainer = (container: Container) => {
container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector);
container.bind<UserRepository>(UserRepository).to(UserRepository);
container.bind<UserApplicationService>(UserApplicationService).to(UserApplicationService);
container.bind<UserService>(UserService).to(UserService);
container.bind<AuthApp>(AuthApp).to(AuthApp);
container.bind<PasswordService>(PasswordService).to(PasswordService);
container.bind<ProductApplicationService>(ProductApplicationService).to(ProductApplicationService);
container.bind<ProductApp>(ProductApp).to(ProductApp);
container.bind<Product>(Product).to(Product);
container.bind<ProductRepository>(ProductRepository).to(ProductRepository);
container.bind<ProductService>(ProductService).to(ProductService);
container.bind<Aggregator>(Aggregator).to(Aggregator);


container.bind<Order>(Order).to(Order);
container.bind<OrderRepository>(OrderRepository).to(OrderRepository);
container.bind<OrderService>(OrderService).to(OrderService);
container.bind<OrderApplicationService>(OrderApplicationService).to(OrderApplicationService);
container.bind<OrderApp>(OrderApp).to(OrderApp);

container.bind<RabbitMQService>('UserRabbitMQServiceQueue').toDynamicValue(() => {
  return new RabbitMQService('amqp://localhost', 'Queue1');
})
  container.bind<RabbitMQService>('ProductRabbitMQServiceQueue').toDynamicValue(() => {
    return new RabbitMQService('amqp://localhost', 'Queue2');
  })
  container.bind<RabbitMQService>('OrderRabbitMQServiceQueue').toDynamicValue(() => {
    return new RabbitMQService('amqp://localhost', 'Queue3');
  })
  container.bind<RabbitMQService>('AggregatorRabbitMQServiceQueue').toDynamicValue(() => {
    return new RabbitMQService('amqp://localhost', 'Queue4');
  })
  container.bind<RabbitMQService>('mg').toDynamicValue(() => {
    return new RabbitMQService('amqp://localhost', 'mg');
  })


  container.bind<RequestResponseMap>(RequestResponseMap).toSelf();
};

export default configureContainer;
