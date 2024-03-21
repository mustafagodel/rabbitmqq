import { inject, injectable } from 'inversify';
import { ProductService } from '../domain/Product/ProductService';
import { ApiResponse } from '../../../infrastructure/ApiResponse';
import { ICreateProduct, IDeleteProduct, IGetProductById, IGetProductByName, IUpdateProduct, IcheckAndDecreaseStockData } from '../dto/Response/interfaces';
import { RabbitMQHandler } from '../../../infrastructure/RabbitMQHandler';


@injectable()
export class ProductApplicationService {
    [x: string]: any;
    constructor(@inject(ProductService) private productService: ProductService, @inject(RabbitMQHandler) private handlerQueue: RabbitMQHandler) { }

    async createProduct(createProduct: ICreateProduct): Promise<ApiResponse<any> | undefined> {
        const existingProduct = await this.getProductByName(createProduct);
        if (existingProduct.message == "Product succes") {
            const existingStock = Number(existingProduct.data.stock);
            const additionalStock = Number(createProduct.stock);

            existingProduct.data.stock = existingStock + additionalStock;
            const updateResult = await this.productService.updateProduct(existingProduct.data.id, existingProduct.data.type, existingProduct.data.name, existingProduct.data.price, existingProduct.data.stock);
            const stockMessage = {
                action: 'addStock',
                productId: existingProduct.data._id,
                Stok: additionalStock,
                operation: 'increase stok'
            };

            const stockMessageText = JSON.stringify(stockMessage);
            this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);

            return new ApiResponse(0, 'Product updated successfully', updateResult)

        } else {
            const createResult = await this.productService.createProduct(createProduct.type,createProduct.name,createProduct.price,createProduct.stock)

            if (createResult) {
                const response = new ApiResponse(0, 'Product created successfully', createResult)
                const stockMessage = {
                    action: 'addStock',
                    productId: response.data.id,
                    Stok: createProduct.stock,
                    operation: 'increase stok'
                };

                const stockMessageText = JSON.stringify(stockMessage);
                this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);
                return response;

            }
            return new ApiResponse(1, 'Failed to create product', null);
        }


    }

    async updateProduct(updateProduct: IUpdateProduct): Promise<ApiResponse<any>> {
        const updatedProduct = await this.productService.updateProduct(updateProduct.id, updateProduct.type, updateProduct.name, updateProduct.price, updateProduct.stock);
        if (updatedProduct) {
            const response = new ApiResponse(0, 'Product updated successfully', updatedProduct);
            const stockMessage = {
                productId: response.data.id,
                Stok: response.data.stock,
                operation: 'update stok'
            };

            const stockMessageText = JSON.stringify(stockMessage);
            this.handlerQueue.sendRabbitMQ('StockQueue', stockMessageText);
            return response;
        }
        return new ApiResponse(1, 'Failed to update product', null);

    }

    async deleteProduct(deleteProduct: IDeleteProduct): Promise<ApiResponse<any>> {
        const result = await this.productService.deleteProduct(deleteProduct.id);

        if (result) {
            return new ApiResponse(0, 'Product deleted successfully', true);
        }
        return new ApiResponse(1, 'Failed to delete product', false);

    }

    async getProductById(getProductById: IGetProductById): Promise<ApiResponse<any>> {
        const product = await this.productService.getProductById(getProductById.id);

        if (product) {
            return new ApiResponse(0, 'Product retrieved successfully', product);
        }
        return new ApiResponse(1, 'Product not found', null);

    }

    async getAllProducts(): Promise<ApiResponse<any>> {
        const products = await this.productService.getAllProducts();

        if (products.length > 0) {
            return new ApiResponse(0, 'Products retrieved successfully', products);
        }
        return new ApiResponse(1, 'No products found', []);

    }
    async getProductByName(getProductByName: IGetProductByName): Promise<ApiResponse<any>> {
        const product = await this.productService.getProductByName(getProductByName.name);

        if (product) {
            return new ApiResponse(0, 'Product succes', product);
        } else {
            return new ApiResponse(1, 'Product not found', null);
        }
    }

    async checkAndDecreaseStock(productdata: IcheckAndDecreaseStockData): Promise<ApiResponse<any> | undefined> {
        const itemsArray: any[] = productdata.items;
        let totalPrice = 0;
        let successFlag = false;
        let productNameWithInsufficientStock: string | null = null;
        for (const item of itemsArray) {
            const productName: string = item.productName;
            const quantity: number = item.quantity;
            const product = await this.productAppService.getProductByName(productdata.name);



            console.log('Retrieved product:', product);

            if (product.message == 'Product not found') {
                const response = new ApiResponse(0, 'Product not found', null);
                return response;
            }

            if (product.data.stock >= quantity) {
                product.data.stock -= quantity;
                this.productService.updateProduct(product.data.id, product.data.type, productName, product.data.price, product.data.stock);

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
            const response = new ApiResponse(0, 'succes', 'Product stock reduced');
            return response;
        }
        if (successFlag == false) {
            const response = new ApiResponse(1, 'insufficient_stock', null);
            return response;
        }
    }
    async checkAndincreaseStock(productdata: IcheckAndDecreaseStockData): Promise<ApiResponse<any> | undefined> {
        const itemsArray: any[] = productdata.items;
        let totalPrice = 0;
        let successFlag = false;
        let productNameWithInsufficientStock: string | null = null;
        for (const item of itemsArray) {
            const productName: string = item.productName;
            const quantity: number = item.quantity;
            const product = await this.productAppService.getProductByName(productdata.name);



            console.log('Retrieved product:', product);

            if (product.message == 'Product not found') {
                const response = new ApiResponse(0, 'Product not found', null);
                return response;
            }

            if (product.data.stock >= quantity) {
                product.data.stock -= quantity;
                this.productService.updateProduct(product.data.id, product.data.type, productName, product.data.price, product.data.stock);

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
            const response = new ApiResponse(0, 'succes', 'Product stock reduced');
            return response;
        }
        if (successFlag == false) {
            const response = new ApiResponse(1, 'insufficient_stock', null);
            return response;
        }

    }

}


