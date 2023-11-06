import { injectable } from 'inversify';
import { ProductService } from '../../Product/domain/Product/ProductService';
import { ApiResponse } from '../../infrastructure/ApiResponse';

@injectable()
export class ProductApplicationService {
    [x: string]: any;
    constructor(private productService: ProductService) {}
    async createProduct(type:string,name: string, price: number, stock: number): Promise<ApiResponse<any>> {
        const createdProduct = await this.productService.createProduct(type,name, price, stock);

        if (createdProduct) {
            return new ApiResponse(0, 'Product created successfully', createdProduct);
        } 
            return new ApiResponse(1, 'Failed to create product', null);
        
    }

    async updateProduct(id: string, type:string,name: string, price: number, stock: number): Promise<ApiResponse<any>> {
        const updatedProduct = await this.productService.updateProduct(id,type,name, price, stock);

        if (updatedProduct) {
            return new ApiResponse(0, 'Product updated successfully', updatedProduct);
        } 
            return new ApiResponse(1, 'Failed to update product', null);
        
    }

    async deleteProduct(id: string): Promise<ApiResponse<any>> {
        const result = await this.productService.deleteProduct(id);

        if (result) {
            return new ApiResponse(0, 'Product deleted successfully', true);
        } 
            return new ApiResponse(1, 'Failed to delete product', false);
        
    }

    async getProductById(id: string): Promise<ApiResponse<any>> {
        const product = await this.productService.getProductById(id);

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
}
