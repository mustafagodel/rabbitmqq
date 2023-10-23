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
exports.MongoDBConnector = void 0;
const mongodb_1 = require("mongodb");
const inversify_1 = require("inversify");
let MongoDBConnector = class MongoDBConnector {
    constructor() {
        this.client = new mongodb_1.MongoClient('mongodb://localhost:27017', {});
        this.db = this.client.db("Database1");
    }
    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db('Database1');
            console.log('MongoDB bağlantısı başarılı.');
        }
        catch (error) {
            console.error('MongoDB bağlantı hatası:', error);
            throw error;
        }
    }
    getDb() {
        return this.db;
    }
};
exports.MongoDBConnector = MongoDBConnector;
exports.MongoDBConnector = MongoDBConnector = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoDBConnector);
//# sourceMappingURL=db.js.map