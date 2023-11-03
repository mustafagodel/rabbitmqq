import { Collection, ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { Product } from './Product';
import { MongoDBConnector } from '../../../infrastructure/db';

@injectable()
export class ProductRepository {
    private collection: Collection | undefined;

    constructor(@inject(MongoDBConnector) private databaseConnector: MongoDBConnector) {
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('products');
    }

    async add(product: Product): Promise<{ success: boolean }> {
        try {
            const result = await this.collection!.insertOne(product);
            if (result.acknowledged) {
                return { success: true };
            } else {
                console.error('The insertion operation failed:', result.acknowledged);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB insertion error:', error);
            return { success: false };
        }
    }

    async update(id: string, updatedProduct: Product): Promise<{ success: boolean }> {
        try {
            const result = await this.collection!.updateOne({ _id: new ObjectId(id) }, { $set: updatedProduct });
            if (result.modifiedCount && result.modifiedCount > 0) {
                return { success: true };
            } else {
                console.error('The update process failed:', result);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB update error:', error);
            return { success: false };
        }
    }

    async delete(id: string): Promise<{ success: boolean }> {
        try {
            const result = await this.collection!.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount && result.deletedCount > 0) {
                return { success: true };
            } else {
                console.error('The deletion process failed:', result);
                return { success: false };
            }
        } catch (error) {
            console.error('MongoDB deletion error:', error);
            return { success: false };
        }
    }

    async getById(id: string): Promise<Product | undefined> {
        if (!this.collection) {
            return undefined;
        }

        try {
            const productDoc = await this.collection.findOne({ _id: new ObjectId(id) });

            if (!productDoc) {
                return undefined;
            }

            const product: Product = new Product(productDoc.type,productDoc.name, productDoc.price, productDoc.stock);
            product.id = productDoc._id.toString();

            return product;
        } catch (error) {
            console.error('MongoDB Query error:', error);
            throw error;
        }
    }

    async getAll(): Promise<Product[]> {
        if (!this.collection) {
            return [];
        }

        try {
            const productsDoc = await this.collection.find({}).toArray();
            const products: Product[] = productsDoc.map((productDoc) => {
                const product: Product = new Product(productDoc.type,productDoc.name, productDoc.price, productDoc.stock);
                product.id = productDoc._id.toString();
                return product;
            });

            return products;
        } catch (error) {
            console.error('MongoDB Query error:', error);
            throw error;
        }
    }
}
