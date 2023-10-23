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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const inversify_1 = require("inversify");
const ProductRepository_1 = require("./ProductRepository");
const Product_1 = require("./Product");
let ProductService = class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async createProduct(name, price, stock) {
        const newProduct = new Product_1.Product(name, price, stock);
        const result = await this.productRepository.add(newProduct);
        if (result.success) {
            return newProduct;
        }
        return undefined;
    }
    async updateProduct(id, name, price, stock) {
        const updatedProduct = new Product_1.Product(name, price, stock);
        const result = await this.productRepository.update(id, updatedProduct);
        if (result.success) {
            return updatedProduct;
        }
        return undefined;
    }
    async deleteProduct(id) {
        const result = await this.productRepository.delete(id);
        if (result.success) {
            return true;
        }
        return false;
    }
    async getProductById(id) {
        return this.productRepository.getById(id);
    }
    async getAllProducts() {
        return this.productRepository.getAll();
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ProductRepository_1.ProductRepository)),
    __metadata("design:paramtypes", [ProductRepository_1.ProductRepository])
], ProductService);
//# sourceMappingURL=ProductService.js.map