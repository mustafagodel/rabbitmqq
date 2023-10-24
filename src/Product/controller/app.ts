import { Request, Response, Router } from 'express';
import { ProductService } from '../../Product/domain/Product/ProductService';
import { inject, injectable } from 'inversify';
import express from 'express';
import { ApiResponse } from '../../infrastructure/ApiResponse';
import { ProductApplicationService } from '../appservices/ProductApplicationService';

@injectable()
export class ProductController {
    private readonly router: Router;
    private readonly productAppService: ProductApplicationService;

    constructor(@inject(ProductService) private productService: ProductService) {
        this.router = express.Router();
        this.productAppService = new ProductApplicationService(productService);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/create', async (req: Request, res: Response) => {
            const { name, price, stock } = req.body;
            const createdProduct = await this.productAppService.createProduct(name, price, stock);

            if (createdProduct) {
                res.json(new ApiResponse(0, 'Product created successfully', createdProduct));
            } else {
                res.status(500).json(new ApiResponse(1, 'Failed to create product', null));
            }
        });

    }

    getRouter(): Router {
        return this.router;
    }
}

export { ProductApplicationService };
