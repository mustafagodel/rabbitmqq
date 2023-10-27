

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../Auth/domain/Users/UserRepository';
import { UserService } from '../Auth/domain/Users/UserService';
import { UserController } from '../Auth/app/app.js';
import { UserApplicationService } from '../Auth/appservices/UserApplicationService';
import  PasswordService  from './PasswordService';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService';
import { ProductController } from '../Product/app/app';
import { Product } from '../Product/domain/Product/Product';
import { ProductRepository } from '../Product/domain/Product/ProductRepository';
import { ProductService } from '../Product/domain/Product/ProductService';
import { RabbitMQService } from '../../src/infrastructure/RabbitMQService'; 

const configureContainer = (container: Container) => {
container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector);
container.bind<UserRepository>(UserRepository).to(UserRepository);
container.bind<UserApplicationService>(UserApplicationService).to(UserApplicationService);
container.bind<UserService>(UserService).to(UserService);
container.bind<UserController>(UserController).to(UserController);
container.bind<PasswordService>(PasswordService).to(PasswordService);
container.bind<ProductApplicationService>(ProductApplicationService).to(ProductApplicationService);
container.bind<ProductController>(ProductController).to(ProductController);
container.bind<Product>(Product).to(Product);
container.bind<ProductRepository>(ProductRepository).to(ProductRepository);
container.bind<ProductService>(ProductService).to(ProductService);
container.bind<RabbitMQService>('RabbitMQServiceQueue1').toDynamicValue(() => {
  return new RabbitMQService('amqp://localhost', 'Queue1');
})
  container.bind<RabbitMQService>('RabbitMQServiceQueue2').toDynamicValue(() => {
    return new RabbitMQService('amqp://localhost', 'Queue2');
  })
  container.bind<RabbitMQService>('RabbitMQServiceQueue3').toDynamicValue(() => {
    return new RabbitMQService('amqp://localhost', 'Queue3');
  })

};

export default configureContainer;
