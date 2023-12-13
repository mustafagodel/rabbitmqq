

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../../src/Auth/domain/Users/UserRepository';
import { UserService } from '../Auth/domain/Users/UserService';
import { AuthApp } from '../Auth/app/app.js';
import { UserApplicationService } from '../Auth/appservices/UserApplicationService';
import  PasswordService  from './SecurityExtension';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService';
import { ProductApp } from '../Product/app/app';
import { Product } from '../Product/domain/Product/Product';
import { ProductRepository } from '../Product/domain/Product/ProductRepository';
import { ProductService } from '../Product/domain/Product/ProductService';
import { RabbitMQProvider } from '../infrastructure/RabbitMQProvider';
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
container.bind<RequestResponseMap>(RequestResponseMap).to(RequestResponseMap);

container.bind<RabbitMQProvider>('UserRabbitMQProviderQueue').toDynamicValue(() => {
  return new RabbitMQProvider('amqp://localhost', 'UserQueue');
}).inRequestScope();

container.bind<RabbitMQProvider>('ProductRabbitMQProviderQueue').toDynamicValue(() => {
  return new RabbitMQProvider('amqp://localhost', 'ProductQueue');
}).inRequestScope();

container.bind<RabbitMQProvider>('OrderRabbitMQProviderQueue').toDynamicValue(() => {
  return new RabbitMQProvider('amqp://localhost', 'OrderQueue');
}).inRequestScope();

container.bind<RabbitMQProvider>('AggregatorRabbitMQProviderQueue').toDynamicValue(() => {
  return new RabbitMQProvider('amqp://localhost', 'AggregatorQueue');
}).inRequestScope();




};

export default configureContainer;
