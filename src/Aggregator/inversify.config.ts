

  import { Container } from 'inversify';
  import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';
  import { MessageRouter } from '../infrastructure/MessageRouter';
  import { Aggregator } from './Aggregator';
  const configureContainer = (container: Container) => {
    container.bind<Aggregator>(Aggregator).to(Aggregator).inSingletonScope();
    container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inSingletonScope();
    container.bind<MessageRouter>(MessageRouter).to(MessageRouter).inSingletonScope();
  

  };

  export default configureContainer;
