

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../Auth/domain/Users/UserRepository';
import { UserService } from '../Auth/domain/Users/UserService';
import { UserController } from '../Auth/controller/app';
import { UserApplicationService } from '../Auth/appservices/UserApplicationService'
import  PasswordService  from './PasswordService';
import { Product } from '../Product/domain/Product/Product';
import { ProductRepository } from '../Product/domain/Product/ProductRepository';
import { ProductService } from '../Product/domain/Product/ProductService';
import { ProductController } from '../Product/controller/app';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService';


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
