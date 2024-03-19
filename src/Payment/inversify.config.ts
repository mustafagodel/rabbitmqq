

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { PaymentApp } from './app/app'
import { PaymentApplicationService } from './appservices/PaymentApplicationService'
import {  Payment } from './domain/Payment/Payment'
import { PaymentRepository } from './domain/Payment/PaymentRepository'
import { PaymentService } from './domain/Payment/PaymentService'
import { RabbitMQHandler } from '../infrastructure/RabbitMQHandler';


const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();

  container.bind<PaymentApp>(PaymentApp).to(PaymentApp).inRequestScope();

  container.bind<PaymentApplicationService>(PaymentApplicationService).to(PaymentApplicationService).inRequestScope();
  
  container.bind<Payment>(Payment).to(Payment).inRequestScope();
  
  container.bind<PaymentRepository>(PaymentRepository).to(PaymentRepository).inRequestScope();
  
  container.bind<PaymentService>(PaymentService).to(PaymentService).inRequestScope();
  
  container.bind<RabbitMQHandler>(RabbitMQHandler).to(RabbitMQHandler).inRequestScope();

};

export default configureContainer;
