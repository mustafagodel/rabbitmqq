

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';


import { ShoppingApp } from './app/app'
import { ShoppingBasketApplicationService } from './appservices/ShoppingBasketApplicationService'
import { ShoppingBasket } from './domain/ShoppingBasket'
import { ShoppingBasketRepository } from './domain/ShoppingBasketRepository'
import { ShoppingBasketService } from './domain/ShoppingBasketService'



const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();

  container.bind<ShoppingApp>(ShoppingApp).to(ShoppingApp).inRequestScope();

  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();
  container.bind<ShoppingBasketApplicationService>(ShoppingBasketApplicationService).to(ShoppingBasketApplicationService).inRequestScope();

  container.bind<ShoppingBasket>(ShoppingBasket).to(ShoppingBasket).inRequestScope();

  container.bind<ShoppingBasketRepository>(ShoppingBasketRepository).to(ShoppingBasketRepository).inRequestScope();

  container.bind<ShoppingBasketService>(ShoppingBasketService).to(ShoppingBasketService).inRequestScope();
};

export default configureContainer;
