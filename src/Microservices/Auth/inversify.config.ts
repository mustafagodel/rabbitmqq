

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from './domain/Users/UserRepository';
import { UserService } from './domain/Users/UserService';

import { UserApplicationService } from './appservices/UserApplicationService';



import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
import { SecurityExtension } from '../../infrastructure/SecurityExtension';


const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();
  container.bind<UserRepository>(UserRepository).to(UserRepository).inRequestScope();
  container.bind<UserApplicationService>(UserApplicationService).to(UserApplicationService).inRequestScope();
  container.bind<UserService>(UserService).to(UserService).inRequestScope();
  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();
  container.bind<SecurityExtension>(SecurityExtension).to(SecurityExtension).inRequestScope();
};

export default configureContainer;
