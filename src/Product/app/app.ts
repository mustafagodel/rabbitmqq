import { Request, Response, Router } from 'express';
import { ProductService } from '../domain/Product/ProductService';
import { id, inject, injectable } from 'inversify';
import express from 'express';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ProductApplicationService } from '../appservices/ProductApplicationService';
import { RabbitMQProvider } from '../../infrastructure/RabbitMQProvider';
import 'reflect-metadata';
import { OrderItem } from '../../Order/domain/Order/Order';
import { Stock } from '../../infrastructure/StockService';

@injectable()
export class ProductApp {
    private readonly router: Router;
    private readonly productAppService: ProductApplicationService;


    constructor(
        @inject(ProductService) private productService: ProductService,
        @inject('ProductRabbitMQProviderQueue') private productrabbitMQProvider: RabbitMQProvider,
        @inject(ProductApplicationService) private productApplicationService: ProductApplicationService,
        @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,
        @inject(Stock) private stock: Stock,


    ) {
        this.router = express.Router();
        this.productAppService = productApplicationService;
        this.productrabbitMQProvider = productrabbitMQProvider;
        this.stock = stock;
        this.productrabbitMQProvider.onMessageReceived((message: string) => {
            this.handleMessage(message);
        });
    }

    public async handleMessage(message: string) {
        try {
            const messageData = JSON.parse(message);

            const func = this.functions[messageData.action];

            if (!func) {
                const responseMessage = {
                    result: 'undefined method',
                };
                const responseMessageText = JSON.stringify(responseMessage);
                this.aggregatorRabbitMQProviderQueue.sendMessage(responseMessageText, (error: any) => {
                    if (error) {
                        console.error('RabbitMQ connection or sending error:', error);
                    }
                    console.log('Response message has been sent to RabbitMQ.');

                });
                return;
            }

            await func(this.productApplicationService, messageData, this.aggregatorRabbitMQProviderQueue, this.stock);
        } catch (error) {
            console.error('Error handling message:', error);

        }
    }






    public functions = {

        async createProduct(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider, stock: Stock) {
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

                rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                    if (error) {
                        console.error('RabbitMQ connection or sending error:', error);
                    } else {
                        console.log('The response message has been sent to RabbitMQ.');

                    }

                });
                stock.Stock(existingProduct.data.id, additionalStock, 'increase stok');

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

                rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                    if (error) {
                        console.error('RabbitMQ connection or sending error:', error);
                    } else {
                        console.log('The response message has been sent to RabbitMQ.');
                    }
                });
                stock.Stock(createResult.data._id, messageData.stock, 'increase stok');
            }


        },
        async updateProduct(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider, stock: Stock) {
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


            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('The response message has been sent to RabbitMQ.');
                }
            });
            stock.Stock(createResult.data._id, messageData.stock, 'update stok');
        }, async deleteProduct(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider, stock: Stock) {
            const createResult = await productAppService.deleteProduct(
                messageData.id,
            );

            const responseMessage = {
                action: 'delete_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);


            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ connection or sending error:', error);
                } else {
                    console.log('The response message has been sent to RabbitMQ.');
                }
            });
            stock.Stock(createResult.data._id, messageData.stock, 'decrease stok');
        }, async getProduct(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const createResult = await productAppService.getProductById(
                messageData.id,
            );
            const responseMessage = {
                action: 'get_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);


            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }, async getAllProduct(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
            const createResult = await productAppService.getAllProducts();

            const responseMessage = {
                action: 'getAll_response',
                response: createResult,
            };
            const responseMessageText = JSON.stringify(responseMessage);


            rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        },
        async checkAndDecreaseStock(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider,stock: Stock) {
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
                    const stok = stock.Stock(product.data.id, quantity, 'decrease stok');
                    if ((await stok).success) {
                        totalPrice += quantity * product.data.price;
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
    
                rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                    if (error) {
                        console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                    } else {
                        console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                    }
                });
    
            }
            if (successFlag == false) {
                const responseMessage = {
                    result: "insufficient_stock",
                    productName: productNameWithInsufficientStock
                };
                const responseMessageText = JSON.stringify(responseMessage);
                rabbitmqService.sendMessage(responseMessageText, (error: any) => {
                    if (error) {
                        console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                    } else {
                        console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                    }
                });
            }
    
        }
    };

  
    async checkAndincreaseStock(messageData: any) {


        const itemsArray: any[] = messageData.items;
        let totalPrice = 0;
        let successFlag = false;
        let productNameWithInsufficientReturn: string | null = null;
        for (const item of itemsArray) {
            const productName: string = item.productName;
            const quantity: number = item.quantity;
            const product = await this.productAppService.getProductByName(productName);



            console.log('Retrieved product:', product);

            if (product.message == 'Product not found') {
                return 'error';
            }

            if (product.data.stock >= quantity) {
                product.data.stock += quantity;
                this.productAppService.updateProduct(product.data.id, product.data.type, productName, product.data.price, product.data.stock);
                const stok = this.stock.Stock(product.data.id, quantity, 'increase stok');
                if ((await stok).success) {
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

            this.aggregatorRabbitMQProviderQueue.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });

        }
        if (successFlag == false) {
            const responseMessage = {
                result: "insufficient_stock",
                productName: productNameWithInsufficientReturn
            };
            const responseMessageText = JSON.stringify(responseMessage);
            this.aggregatorRabbitMQProviderQueue.sendMessage(responseMessageText, (error: any) => {
                if (error) {
                    console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
                } else {
                    console.log('Response mesajı RabbitMQ\'ya gönderildi.');
                }
            });
        }

    }




    async getNameProduct(productAppService: ProductApplicationService, messageData: any, rabbitmqService: RabbitMQProvider) {
        const createResult = await productAppService.getProductByName(
            messageData.name,
        );

        const responseMessage = {
            action: 'getname_response',
            response: createResult,
        };
        const responseMessageText = JSON.stringify(responseMessage);

        rabbitmqService.sendMessage(responseMessageText, (error: any) => {
            if (error) {
                console.error('RabbitMQ connection or sending error:', error);
            } else {
                console.log('Response message has been sent to RabbitMQ.');
            }
        });
    }
   
}