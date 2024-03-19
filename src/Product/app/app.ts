import { Request, Response, Router } from 'express';
import { id, inject, injectable } from 'inversify';
import express from 'express';

import { ProductApplicationService } from '../appservices/ProductApplicationService';

import 'reflect-metadata';

import { RabbitMQHandler } from '../../infrastructure/RabbitMQHandler';
interface IMessageData {
    action: string;
    name: string;
    type: string;
    price: number;
    stock: number;
    id: string;
    items: any[]; 
    productName:string;

}
@injectable()
export class ProductApp {

    private readonly productAppService: ProductApplicationService;


    constructor(
        @inject(ProductApplicationService) private productApplicationService: ProductApplicationService,
        @inject(RabbitMQHandler) private handlerQueue: RabbitMQHandler
    ) {
    
        this.productAppService = productApplicationService;

   
    
    }


    public async handleMessage() {
        this.handlerQueue.listenForMessages('ProductQueue', (response: any) => {
            this.handleMessageAction(response.content.toString());
      });
    }
    private async handleMessageAction(message: string) {
        try {
            const messageData = JSON.parse(message);
            const action = messageData.action as keyof ProductApp['functions'];
            const func = this.functions[action];

            if (!func) {
                const responseMessage = {
                    result: 'undefined method',
                };
                const responseMessageText = JSON.stringify(responseMessage);
                this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);
                return;
            }

            await func(this.productApplicationService, messageData);
        } catch (error) {
            console.error('Error handling message:', error);

        }
    }






    private functions = {

         createProduct:async (productAppService: ProductApplicationService, messageData: IMessageData) => {
            let productId: string | undefined;
            const existingProduct = await productAppService.getProductByName(messageData.name);


            if (existingProduct.message == "Product succes") {
                const existingStock = Number(existingProduct.data.stock);
                const additionalStock = Number(messageData.stock);


                existingProduct.data.stock = existingStock + additionalStock;
                const updateResult = await productAppService.updateProduct(existingProduct.data.id, existingProduct.data.type, existingProduct.data.name, existingProduct.data.price, existingProduct.data.stock);

                const responseMessage = {
                    response: updateResult,
                };

                const responseMessageText = JSON.stringify(responseMessage);
                this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);

                const stockMessage = {
                    productId: existingProduct.data._id,
                    Stok:  messageData.stock,
                    operation: 'increase stok'
                };
             
                const stockMessageText = JSON.stringify(stockMessage);
                this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);

            } else {
                const createResult = await productAppService.createProduct(
                    messageData.type,
                    messageData.name,
                    messageData.price,
                    messageData.stock
                );

                const responseMessage = {
                    response: createResult,
                };

                const responseMessageText = JSON.stringify(responseMessage);

                this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);

     
                const stockMessage = {
                    productId: createResult.data._id,
                    Stok:  messageData.stock,
                    operation: 'increase stok'
                };
             
                const stockMessageText = JSON.stringify(stockMessage);
                this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);
            }


        },
         updateProduct:async(productAppService: ProductApplicationService, messageData: IMessageData)=> {
            const createResult = await productAppService.updateProduct(
                messageData.id,
                messageData.type,
                messageData.name,
                messageData.price,
                messageData.stock
            );

            const responseMessage = {
                action: 'update_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);


            this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);
            const stockMessage = {
                productId: createResult.data._id,
                Stok:  messageData.stock,
                operation: 'update stok'
            };
         
            const stockMessageText = JSON.stringify(stockMessage);
            this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);
        },  deleteProduct:async(productAppService: ProductApplicationService, messageData: any)=> {
            const createResult = await productAppService.deleteProduct(
                messageData.id,
            );

            const responseMessage = {
                action: 'delete_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);

            this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);
            const stockMessage = {
                productId: createResult.data._id,
                Stok:  messageData.stock,
                operation: 'decrease stok'
            };
         
            const stockMessageText = JSON.stringify(stockMessage);
            this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);
        },  getProduct:async(productAppService: ProductApplicationService, messageData: IMessageData) => {
            const createResult = await productAppService.getProductById(
                messageData.id,
            );
            const responseMessage = {
                action: 'get_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);


            this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);
        },  getAllProduct:async(productAppService: ProductApplicationService, messageData: IMessageData) => {
            const createResult = await productAppService.getAllProducts();

            const responseMessage = {
                action: 'getAll_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);


            this.handlerQueue.sendRabbitMQ('AggregatorQueue',responseMessageText);
        },
         checkAndDecreaseStock:async(productAppService: ProductApplicationService, messageData: IMessageData) => {
            const itemsArray: any[] = messageData.items;
            let totalPrice = 0;
            let successFlag = false;
            let productNameWithInsufficientStock: string | null = null;
            for (const item of itemsArray) {
                const productName: string = item.productName;
                const quantity: number = item.quantity;
                const product = await productAppService.getProductByName(productName);
    
    
    
                console.log('Retrieved product:', product);
    
                if (product.message == 'Product not found') {
                    return 'error';
                }
    
                if (product.data.stock >= quantity) {
                    product.data.stock -= quantity;
                    productAppService.updateProduct(product.data.id, product.data.type, productName, product.data.price, product.data.stock);
                    
             
                    const responseMessage = {
                        productId: product.data.id,
                        Stok: quantity,
                        operation: 'decrease stok'
                    };
                 
                    const responseMessageText = JSON.stringify(responseMessage);
                    this.handlerQueue.sendRabbitMQ('StockQueue', responseMessageText);
                    if (totalPrice += quantity * product.data.price) {
                        successFlag = true;
                    } else {
                        successFlag = false;
                    }
                } else {
    
                    if (!productNameWithInsufficientStock) {
                        productNameWithInsufficientStock = productName;
                        successFlag = false;
                    }
                }
            }
            if (successFlag) {
                const responseMessage = {
                    result: "succes"
                };
                const responseMessageText = JSON.stringify(responseMessage);
    
                this.handlerQueue.sendRabbitMQ('ResponseQueue',responseMessageText);
    
            }
            if (successFlag == false) {
                const responseMessage = {
                    result: "insufficient_stock",
                    productName: productNameWithInsufficientStock
                };
                const responseMessageText = JSON.stringify(responseMessage);
                this.handlerQueue.sendRabbitMQ('ResponseQueue',responseMessageText);
            }
    
        },
         checkAndincreaseStock:async(productAppService: ProductApplicationService, messageData: IMessageData) => {


            const itemsArray: any[] = messageData.items;
            let totalPrice = 0;
            let successFlag = false;
            let productNameWithInsufficientReturn: string | null = null;
            for (const item of itemsArray) {
                const productName: string = item.productName;
                const quantity: number = item.quantity;
                const product = await productAppService.getProductByName(productName);
    
    
    
                console.log('Retrieved product:', product);
    
                if (product.message == 'Product not found') {
                    return 'error';
                }
    
                if (product.data.stock >= quantity) {
                    product.data.stock += quantity;

                    this.productAppService.updateProduct(product.data.id, product.data.type, productName, product.data.price, product.data.stock);
                    const responseMessage = {
                        productId: product.data.id,
                        Stok: quantity,
                        operation: 'increase stok'
                    };
                 
                    const responseMessageText = JSON.stringify(responseMessage);
                    this.handlerQueue.sendRabbitMQ('StockQueue', responseMessageText);
                 
                    if (totalPrice += quantity * product.data.price) {
                        totalPrice += quantity * product.data.price;
                        successFlag = true;
                    } else {
                        successFlag = false;
                    }
                } else {
    
                    if (!productNameWithInsufficientReturn) {
                        productNameWithInsufficientReturn = productName;
                        successFlag = false;
                    }
                }
            }
    
            if (successFlag) {
                const responseMessage = {
                    result: "succes"
                };
                const responseMessageText = JSON.stringify(responseMessage);
    
                this.handlerQueue.sendRabbitMQ('ResponseQueue',responseMessageText);
            }
            if (successFlag == false) {
                const responseMessage = {
                    result: "insufficient_stock",
                    productName: productNameWithInsufficientReturn
                };
                const responseMessageText = JSON.stringify(responseMessage);
                this.handlerQueue.sendRabbitMQ('ResponseQueue',responseMessageText);
            }
    
        
    },
     getNameProduct:async(productAppService: ProductApplicationService, messageData: IMessageData) => {
        const createResult = await productAppService.getProductByName(
            messageData.productName,
        );

        const responseMessage = {
            action: 'getname_response',
            response: createResult,
        };
        const responseMessageText = JSON.stringify(responseMessage);

        this.handlerQueue.sendRabbitMQ('RollBack',responseMessageText);
    }
    
    };

  
   



}