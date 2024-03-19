

import { Container } from 'inversify';

import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';
import { MessageRouter } from '../infrastructure/MessageRouter';

const configureContainer = (container: Container) => {
  container.bind<MessageRouter>(MessageRouter).to(MessageRouter).inSingletonScope();  
  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inSingletonScope();
};

export default configureContainer;
