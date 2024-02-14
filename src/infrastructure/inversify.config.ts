

import { Container } from 'inversify';
import { MongoDBConnector } from './db';
import { UserRepository } from '../../src/Auth/domain/Users/UserRepository';
import { UserService } from '../Auth/domain/Users/UserService';
import { AuthApp } from '../Auth/app/app.js';
import { UserApplicationService } from '../Auth/appservices/UserApplicationService';
import PasswordService from './SecurityExtension';
import { ProductApplicationService } from '../Product/appservices/ProductApplicationService';
import { ProductApp } from '../Product/app/app';
import { Product } from '../Product/domain/Product/Product';
import { ProductRepository } from '../Product/domain/Product/ProductRepository';
import { ProductService } from '../Product/domain/Product/ProductService';
import { RabbitMQProvider } from '../infrastructure/RabbitMQProvider';
import { RequestResponseMap } from '../infrastructure/RequestResponseMap';
import { RollbackService } from '../infrastructure/RollbackServiceSaga';

import { Order } from '../Order/domain/Order/Order';
import { Return } from '../Return/domain/Return/Return';
import { ReturnService } from '../Return/domain/Return/ReturnService';
import { ReturnRepository } from '../Return/domain/Return/ReturnRepository';
import { ReturnApplicationService } from '../Return/appservices/ReturnApplicationService';
import { ReturnApp } from '../Return/app/app';
import { OrderRepository } from '../Order/domain/Order/OrderRepository';
import { OrderService } from '../Order/domain/Order/OrderService';
import { OrderApplicationService } from '../Order/appservices/OrderApplicationService';
import { OrderApp } from '../Order/app/app';
import { Aggregator } from '../infrastructure/Aggregator';
import { Stock } from './StockService';
import { ShoppingApp } from '../ShoppingBasket/app/app'
import { ShoppingBasketApplicationService } from '../ShoppingBasket/appservices/ShoppingBasketApplicationService'
import { ShoppingBasket } from '../ShoppingBasket/domain/ShoppingBasket'
import { ShoppingBasketRepository } from '../ShoppingBasket/domain/ShoppingBasketRepository'
import { ShoppingBasketService } from '../ShoppingBasket/domain/ShoppingBasketService'

import { PaymentApp } from '../Payment/app/app'
import { PaymentApplicationService } from '../Payment/appservices/PaymentApplicationService'
import {  Payment } from '../Payment/domain/Payment/Payment'
import { PaymentRepository } from '../Payment/domain/Payment/PaymentRepository'
import { PaymentService } from '../Payment/domain/Payment/PaymentService'




const configureContainer = (container: Container) => {
  container.bind<MongoDBConnector>(MongoDBConnector).to(MongoDBConnector).inSingletonScope();

  container.bind<UserRepository>(UserRepository).to(UserRepository).inRequestScope();

  container.bind<UserApplicationService>(UserApplicationService).to(UserApplicationService).inRequestScope();

  container.bind<UserService>(UserService).to(UserService).inRequestScope();




  container.bind<Stock>(Stock).to(Stock).inSingletonScope();


  container.bind<PasswordService>(PasswordService).to(PasswordService).inRequestScope();

  container.bind<ProductApplicationService>(ProductApplicationService).to(ProductApplicationService).inRequestScope();

  container.bind<ProductApp>(ProductApp).to(ProductApp).inSingletonScope();

  container.bind<Product>(Product).to(Product).inRequestScope();

  container.bind<ProductRepository>(ProductRepository).to(ProductRepository).inRequestScope();

  container.bind<ProductService>(ProductService).to(ProductService).inRequestScope();

  container.bind<Aggregator>(Aggregator).to(Aggregator).inSingletonScope();



  container.bind<Order>(Order).to(Order).inRequestScope();

  container.bind<OrderRepository>(OrderRepository).to(OrderRepository).inRequestScope();

  container.bind<OrderService>(OrderService).to(OrderService).inRequestScope();

  container.bind<OrderApplicationService>(OrderApplicationService).to(OrderApplicationService).inRequestScope();

  container.bind<OrderApp>(OrderApp).to(OrderApp).inRequestScope();

  container.bind<RequestResponseMap>(RequestResponseMap).to(RequestResponseMap).inSingletonScope();


  container.bind<Return>(Return).to(Return).inRequestScope();

  container.bind<ReturnService>(ReturnService).to(ReturnService).inRequestScope();

  container.bind<ReturnRepository>(ReturnRepository).to(ReturnRepository).inRequestScope();

  container.bind<ReturnApplicationService>(ReturnApplicationService).to(ReturnApplicationService).inRequestScope();

  container.bind<ReturnApp>(ReturnApp).to(ReturnApp).inRequestScope();


  container.bind<ShoppingApp>(ShoppingApp).to(ShoppingApp).inRequestScope();

  container.bind<ShoppingBasketApplicationService>(ShoppingBasketApplicationService).to(ShoppingBasketApplicationService).inRequestScope();

  container.bind<ShoppingBasket>(ShoppingBasket).to(ShoppingBasket).inRequestScope();

  container.bind<ShoppingBasketRepository>(ShoppingBasketRepository).to(ShoppingBasketRepository).inRequestScope();

  container.bind<ShoppingBasketService>(ShoppingBasketService).to(ShoppingBasketService).inRequestScope();


  container.bind<PaymentApp>(PaymentApp).to(PaymentApp).inRequestScope();

  container.bind<PaymentApplicationService>(PaymentApplicationService).to(PaymentApplicationService).inRequestScope();
  
  container.bind<Payment>(Payment).to(Payment).inRequestScope();
  
  container.bind<PaymentRepository>(PaymentRepository).to(PaymentRepository).inRequestScope();
  
  container.bind<PaymentService>(PaymentService).to(PaymentService).inRequestScope();
  container.bind<RollbackService>(RollbackService).to(RollbackService).inRequestScope();
  

  container.bind<AuthApp>(AuthApp).to(AuthApp).inRequestScope();



  container.bind<RabbitMQProvider>('UserRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'UserQueue');
  }).inRequestScope();

  container.bind<RabbitMQProvider>('ShoppingBasketRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'BasketQueue');
  }).inRequestScope();

  container.bind<RabbitMQProvider>('ProductRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'ProductQueue');
  }).inRequestScope();

  container.bind<RabbitMQProvider>('OrderRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'OrderQueue');
  }).inRequestScope();

  container.bind<RabbitMQProvider>('AggregatorRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'AggregatorQueue');
  }).inRequestScope();
  container.bind<RabbitMQProvider>('ReturnRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'ReturnQueue');
  }).inRequestScope();
  container.bind<RabbitMQProvider>('ApiGateWayRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'ApiGate');
  }).inRequestScope();
  container.bind<RabbitMQProvider>('PaymentRabbitMQProviderQueue').toDynamicValue(() => {
    return new RabbitMQProvider('amqp://localhost', 'Payment');
  }).inRequestScope();




};

export default configureContainer;
