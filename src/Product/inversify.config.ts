

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import PasswordService from '../infrastructure/SecurityExtension';
import { ProductApplicationService } from './appservices/ProductApplicationService';
import { ProductApp } from './app/app';
import { Product } from './domain/Product/Product';
import { ProductRepository } from './domain/Product/ProductRepository';
import { ProductService } from './domain/Product/ProductService';
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';



const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();

  container.bind<PasswordService>(PasswordService).to(PasswordService).inRequestScope();

  container.bind<ProductApplicationService>(ProductApplicationService).to(ProductApplicationService).inRequestScope();

  container.bind<ProductApp>(ProductApp).to(ProductApp).inSingletonScope();

  container.bind<Product>(Product).to(Product).inRequestScope();

  container.bind<ProductRepository>(ProductRepository).to(ProductRepository).inRequestScope();

  container.bind<ProductService>(ProductService).to(ProductService).inRequestScope();

  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();
};

export default configureContainer;
