"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const UserRepository_1 = require("../Auth/domain/Users/UserRepository");
const UserService_1 = require("../Auth/domain/Users/UserService");
const app_1 = require("../Auth/controller/app");
const UserApplicationService_1 = require("../Auth/appservices/UserApplicationService");
const PasswordService_1 = __importDefault(require("./PasswordService"));
const Product_1 = require("../Product/domain/Product/Product");
const ProductRepository_1 = require("../Product/domain/Product/ProductRepository");
const ProductService_1 = require("../Product/domain/Product/ProductService");
const app_2 = require("../Product/controller/app");
const ProductApplicationService_1 = require("../Product/appservices/ProductApplicationService");
const configureContainer = (container) => {
    container.bind(db_1.MongoDBConnector).to(db_1.MongoDBConnector);
    container.bind(UserRepository_1.UserRepository).to(UserRepository_1.UserRepository);
    container.bind(UserApplicationService_1.UserApplicationService).to(UserApplicationService_1.UserApplicationService);
    container.bind(UserService_1.UserService).to(UserService_1.UserService);
    container.bind(app_1.UserController).to(app_1.UserController);
    container.bind(PasswordService_1.default).to(PasswordService_1.default);
    container.bind(Product_1.Product).to(Product_1.Product);
    container.bind(ProductRepository_1.ProductRepository).to(ProductRepository_1.ProductRepository);
    container.bind(ProductService_1.ProductService).to(ProductService_1.ProductService);
    container.bind(app_2.ProductController).to(app_2.ProductController);
    container.bind(ProductApplicationService_1.ProductApplicationService).to(ProductApplicationService_1.ProductApplicationService);
};
exports.default = configureContainer;
//# sourceMappingURL=inversify.config.js.map