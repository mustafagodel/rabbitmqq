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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductApplicationService = exports.ProductController = void 0;
const ProductService_1 = require("../domain/Product/ProductService");
const inversify_1 = require("inversify");
const express_1 = __importDefault(require("express"));
const ApiResponse_1 = require("../../infrastructure/ApiResponse");
const ProductApplicationService_1 = require("../appservices/ProductApplicationService");
Object.defineProperty(exports, "ProductApplicationService", { enumerable: true, get: function () { return ProductApplicationService_1.ProductApplicationService; } });
let ProductController = class ProductController {
    constructor(productService) {
        this.productService = productService;
        this.router = express_1.default.Router();
        this.productAppService = new ProductApplicationService_1.ProductApplicationService(productService);
        this.initRoutes();
    }
    initRoutes() {
        this.router.post('/create', async (req, res) => {
            const { name, price, stock } = req.body;
            const createdProduct = await this.productAppService.createProduct(name, price, stock);
            if (createdProduct) {
                res.json(new ApiResponse_1.ApiResponse(0, 'Product created successfully', createdProduct));
            }
            else {
                res.status(500).json(new ApiResponse_1.ApiResponse(1, 'Failed to create product', null));
            }
        });
    }
    getRouter() {
        return this.router;
    }
};
exports.ProductController = ProductController;
exports.ProductController = ProductController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ProductService_1.ProductService)),
    __metadata("design:paramtypes", [ProductService_1.ProductService])
], ProductController);
//# sourceMappingURL=ProductController.js.map