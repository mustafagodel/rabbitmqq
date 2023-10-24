

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../Login/domain/Users/UserRepository';
import { UserService } from '../Login/domain/Users/UserService';
import { UserController } from '../Login/controller/app.js';
import { UserApplicationService } from '../Login/appservices/UserApplicationService';
import  PasswordService  from './PasswordService';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService'
import { ProductController } from '../Product/controller/app'
import { Product } from '../Product/domain/Product/Product'
import { ProductRepository } from '../Product/domain/Product/ProductRepository'
import { ProductService } from '../Product/domain/Product/ProductService'

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

};

export default configureContainer;
