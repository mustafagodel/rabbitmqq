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
exports.ProductRepository = void 0;
const mongodb_1 = require("mongodb");
const inversify_1 = require("inversify");
const Product_1 = require("./Product");
const db_1 = require("../../../infrastructure/db");
let ProductRepository = class ProductRepository {
    constructor(databaseConnector) {
        this.databaseConnector = databaseConnector;
        databaseConnector.connect();
        this.collection = databaseConnector.getDb()?.collection('products');
    }
    async add(product) {
        try {
            const result = await this.collection.insertOne(product);
            if (result.acknowledged) {
                return { success: true };
            }
            else {
                console.error('Ekleme işlemi başarısız:', result.acknowledged);
                return { success: false };
            }
        }
        catch (error) {
            console.error('MongoDB ekleme hatası:', error);
            return { success: false };
        }
    }
    async update(id, updatedProduct) {
        try {
            const result = await this.collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updatedProduct });
            if (result.modifiedCount && result.modifiedCount > 0) {
                return { success: true };
            }
            else {
                console.error('Güncelleme işlemi başarısız:', result);
                return { success: false };
            }
        }
        catch (error) {
            console.error('MongoDB güncelleme hatası:', error);
            return { success: false };
        }
    }
    async delete(id) {
        try {
            const result = await this.collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            if (result.deletedCount && result.deletedCount > 0) {
                return { success: true };
            }
            else {
                console.error('Silme işlemi başarısız:', result);
                return { success: false };
            }
        }
        catch (error) {
            console.error('MongoDB silme hatası:', error);
            return { success: false };
        }
    }
    async getById(id) {
        if (!this.collection) {
            return undefined;
        }
        try {
            const productDoc = await this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!productDoc) {
                return undefined;
            }
            const product = new Product_1.Product(productDoc.name, productDoc.price, productDoc.stock);
            product.id = productDoc._id.toString();
            return product;
        }
        catch (error) {
            console.error('MongoDB sorgusu hatası:', error);
            throw error;
        }
    }
    async getAll() {
        if (!this.collection) {
            return [];
        }
        try {
            const productsDoc = await this.collection.find({}).toArray();
            const products = productsDoc.map((productDoc) => {
                const product = new Product_1.Product(productDoc.name, productDoc.price, productDoc.stock);
                product.id = productDoc._id.toString();
                return product;
            });
            return products;
        }
        catch (error) {
            console.error('MongoDB sorgusu hatası:', error);
            throw error;
        }
    }
};
exports.ProductRepository = ProductRepository;
exports.ProductRepository = ProductRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(db_1.MongoDBConnector)),
    __metadata("design:paramtypes", [db_1.MongoDBConnector])
], ProductRepository);
//# sourceMappingURL=ProductRepository.js.map