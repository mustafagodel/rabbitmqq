import { inject, injectable } from 'inversify';
import { ProductRepository } from './ProductRepository';
import { Product } from './Product';
import { IProductData } from '../../dto/Response/interfaces';

@injectable()
export class ProductService {
    constructor(@inject(ProductRepository) private productRepository: ProductRepository) { }

    async createProduct(productdata:IProductData): Promise<Product | undefined> {

        const newProduct = new Product(productdata.type, productdata.name, productdata.price,productdata.stock);
        const result = await this.productRepository.add(newProduct);

        if (result.success) {

            return newProduct;
        }

        return undefined;
    }

    async updateProduct(id: string, type: string, name: string, price: number, stock: number): Promise<Product | undefined> {

        const updatedProduct = new Product(type, name, price, stock);
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
    async getProductByName(name: string): Promise<Product | undefined> {
        try {
            const product = await this.productRepository.getByName(name);

            if (product) {
                return product;
            }

            return undefined;
        } catch (error) {
            console.error('Error while fetching product by name:', error);
            throw error;
        }
    }

}
