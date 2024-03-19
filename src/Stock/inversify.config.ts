

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';


import { StockApp } from './app/app'
import { StockApplicationService } from './appservices/StockApplicationService'
import { Stock } from './domain/Stock'
import { StockRepository } from './domain/StockRepository'
import { StockService } from './domain/StockService'



const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();

  container.bind<StockApp>(StockApp).to(StockApp).inRequestScope();

  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();
  container.bind<StockApplicationService>(StockApplicationService).to(StockApplicationService).inRequestScope();

  container.bind<Stock>(Stock).to(Stock).inRequestScope();

  container.bind<StockRepository>(StockRepository).to(StockRepository).inRequestScope();

  container.bind<StockService>(StockService).to(StockService).inRequestScope();
};

export default configureContainer;
