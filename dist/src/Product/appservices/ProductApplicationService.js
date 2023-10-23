"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductApplicationService = void 0;
const inversify_1 = require("inversify");
const ProductService_1 = require("../domain/Product/ProductService");
const ApiResponse_1 = require("../../infrastructure/ApiResponse");
let ProductApplicationService = class ProductApplicationService {
    constructor(productService) {
        this.productService = productService;
    }
    async createProduct(name, price, stock) {
        const createdProduct = await this.productService.createProduct(name, price, stock);
        if (createdProduct) {
            return new ApiResponse_1.ApiResponse(0, 'Product created successfully', createdProduct);
        }
        else {
            return new ApiResponse_1.ApiResponse(1, 'Failed to create product', null);
        }
    }
    async updateProduct(id, name, price, stock) {
        const updatedProduct = await this.productService.updateProduct(id, name, price, stock);
        if (updatedProduct) {
            return new ApiResponse_1.ApiResponse(0, 'Product updated successfully', updatedProduct);
        }
        else {
            return new ApiResponse_1.ApiResponse(1, 'Failed to update product', null);
        }
    }
    async deleteProduct(id) {
        const result = await this.productService.deleteProduct(id);
        if (result) {
            return new ApiResponse_1.ApiResponse(0, 'Product deleted successfully', true);
        }
        else {
            return new ApiResponse_1.ApiResponse(1, 'Failed to delete product', false);
        }
    }
    async getProductById(id) {
        const product = await this.productService.getProductById(id);
        if (product) {
            return new ApiResponse_1.ApiResponse(0, 'Product retrieved successfully', product);
        }
        else {
            return new ApiResponse_1.ApiResponse(1, 'Product not found', null);
        }
    }
    async getAllProducts() {
        const products = await this.productService.getAllProducts();
        if (products.length > 0) {
            return new ApiResponse_1.ApiResponse(0, 'Products retrieved successfully', products);
        }
        else {
            return new ApiResponse_1.ApiResponse(1, 'No products found', []);
        }
    }
};
exports.ProductApplicationService = ProductApplicationService;
exports.ProductApplicationService = ProductApplicationService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [ProductService_1.ProductService])
], ProductApplicationService);
//# sourceMappingURL=ProductApplicationService.js.map