

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../domain/Users/UserRepository';
import { UserService } from '../domain/Users/UserService';
import { UserController } from '../controller/UserController';
import { UserApplicationService } from '../appservices/UserApplicationService'
import  PasswordService  from '../infrastructure/PasswordService';
import { Product } from '../domain/Users/Product/Product';
import { ProductRepository } from '../domain/Users/Product/ProductRepository';
import { ProductService } from '../domain/Users/Product/ProductService';
import { ProductController } from '../controller/ProductController';
import { ProductApplicationService } from '../appservices/ProductApplicationService';

const configureContainer = (container: Container) => {
container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector);
container.bind<UserRepository>(UserRepository).to(UserRepository);
container.bind<UserApplicationService>(UserApplicationService).to(UserApplicationService);
container.bind<UserService>(UserService).to(UserService);
container.bind<UserController>(UserController).to(UserController);
container.bind<PasswordService>(PasswordService).to(PasswordService);
container.bind<Product>(Product).to(Product);
container.bind<ProductRepository>(ProductRepository).to(ProductRepository);
container.bind<ProductService>(ProductService).to(ProductService);
container.bind<ProductController>(ProductController).to(ProductController);
container.bind<ProductApplicationService>(ProductApplicationService).to(ProductApplicationService);
};

export default configureContainer;
