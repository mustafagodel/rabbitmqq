"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const UserRepository_1 = require("../Login/domain/Users/UserRepository");
const UserService_1 = require("../Login/domain/Users/UserService");
const UserController_1 = require("../Login/controller/UserController");
const UserApplicationService_1 = require("../Login/appservices/UserApplicationService");
const PasswordService_1 = __importDefault(require("./PasswordService"));
const configureContainer = (container) => {
    container.bind(db_1.MongoDBConnector).to(db_1.MongoDBConnector);
    container.bind(UserRepository_1.UserRepository).to(UserRepository_1.UserRepository);
    container.bind(UserApplicationService_1.UserApplicationService).to(UserApplicationService_1.UserApplicationService);
    container.bind(UserService_1.UserService).to(UserService_1.UserService);
    container.bind(UserController_1.UserController).to(UserController_1.UserController);
    container.bind(PasswordService_1.default).to(PasswordService_1.default);
};
exports.default = configureContainer;
//# sourceMappingURL=inversify.config.js.map