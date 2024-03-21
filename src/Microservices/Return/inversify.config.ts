

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { Return } from './domain/Return/Return';
import { ReturnService } from './domain/Return/ReturnService';
import { ReturnRepository } from './domain/Return/ReturnRepository';
import { ReturnApplicationService } from './appservices/ReturnApplicationService';
import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';

const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();


  container.bind<Return>(Return).to(Return).inRequestScope();

  container.bind<ReturnService>(ReturnService).to(ReturnService).inRequestScope();

  container.bind<ReturnRepository>(ReturnRepository).to(ReturnRepository).inRequestScope();

  container.bind<ReturnApplicationService>(ReturnApplicationService).to(ReturnApplicationService).inRequestScope();

  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();

};

export default configureContainer;
