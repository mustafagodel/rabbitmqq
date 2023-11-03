import { inject, injectable } from 'inversify';
import { ProductRepository } from './ProductRepository';
import { Product } from './Product';

@injectable()
export class ProductService {
    constructor(@inject(ProductRepository) private productRepository: ProductRepository) {}

    async createProduct(type:string,name: string, price: number, stock: number): Promise<Product | undefined> {

        const newProduct = new Product(type,name, price, stock);
        const result = await this.productRepository.add(newProduct);

        if (result.success) {
           
            return newProduct;
        }

        return undefined;
    }

    async updateProduct(id: string,type:string, name: string, price: number, stock: number): Promise<Product | undefined> {

        const updatedProduct = new Product(type,name, price, stock);
        const result = await this.productRepository.update(id, updatedProduct);

        if (result.success) {
      
            return updatedProduct;
        }

        return undefined;
    }

    async deleteProduct(id: string): Promise<boolean> {
     
        const result = await this.productRepository.delete(id);

        if (result.success) {
          
            return true;
        }

        return false;
    }

    async getProductById(id: string): Promise<Product | undefined> {
   
        return this.productRepository.getById(id);
    }

    async getAllProducts(): Promise<Product[]> {
 
        return this.productRepository.getAll();
    }
}
