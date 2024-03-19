
  import { inject, injectable } from 'inversify';

  @injectable()
  export class MessageRouter {
    private requestMap: Record<string, {queueName: string, isAdmin: boolean}> = {};

    constructor(
    ) {
      this.requestMap = {
        'login': {
          queueName: 'UserQueue',
          isAdmin: false
        },
        'register': {
          queueName: 'UserQueue',
          isAdmin: false
        },
        'createProduct': {
          queueName: 'ProductQueue',
          isAdmin: true
        },
        'getProduct': {
          queueName: 'ProductQueue',
          isAdmin: false
        },
        'deleteProduct': {
          queueName: 'ProductQueue',
          isAdmin: true
        },
        'getAllProduct': {
          queueName: 'ProductQueue',
          isAdmin: false
        },
        'updateProduct': {
          queueName: 'ProductQueue',
          isAdmin: true
        },
        'createOrder': {
          queueName: 'OrderQueue',
          isAdmin: false
        },
        'updateOrder': {
          queueName: 'OrderQueue',
          isAdmin: false
        },
        'deleteOrder': {
          queueName: 'OrderQueue',
          isAdmin: false
        },
        'getOrder':{
          queueName: 'OrderQueue',
          isAdmin: false
        },
        'getAllOrders': {
          queueName: 'OrderQueue',
          isAdmin: false
        },
        'getname': {
          queueName: 'OrderQueue',
          isAdmin: false
        },
        'checkAndDecreaseStock':  {
          queueName: 'ProductQueue',
          isAdmin: false
        },
        'createReturn':{
          queueName: 'ReturnQueue',
          isAdmin: false
        },
        'checkReturn,': {
          queueName: 'ReturnQueue',
          isAdmin: false
        },
        'addShoppingBasket':{
          queueName: 'ShoppingQueue',
          isAdmin: false
        },
        'completeShoppingBasket':  {
          queueName: 'ShoppingQueue',
          isAdmin: false
        },
        'processPayment':{
          queueName: 'PaymentQueue',
          isAdmin: false
        },
        'handleMessage' : {
          queueName: 'PaymentQueue',
          isAdmin: false
        },
        'Apigate' : {
          queueName: 'ApiGate',
          isAdmin: false
        },
      };
    }


    requiresToken(action: string): boolean {
      return action !== 'login' && action !== 'register';
    }

    requiresCustomerRole(action: string, userRole: string): boolean {

      return userRole !== 'customer' && !this.requestMap[action].isAdmin; 
    }
    getRequestService(action: string): string | undefined {
      return this.requestMap[action].queueName;
    }
  }
      
    
