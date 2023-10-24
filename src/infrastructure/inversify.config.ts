

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../Login/domain/Users/UserRepository';
import { UserService } from '../Login/domain/Users/UserService';
import { UserController } from '../Login/controller/UserController';
import { UserApplicationService } from '../Login/appservices/UserApplicationService'
import  PasswordService  from './PasswordService';

const configureContainer = (container: Container) => {
container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector);
container.bind<UserRepository>(UserRepository).to(UserRepository);
container.bind<UserApplicationService>(UserApplicationService).to(UserApplicationService);
container.bind<UserService>(UserService).to(UserService);
container.bind<UserController>(UserController).to(UserController);
container.bind<PasswordService>(PasswordService).to(PasswordService);
};

export default configureContainer;
