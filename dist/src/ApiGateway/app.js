"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const body_parser_1 = __importDefault(require("body-parser"));
const inversify_1 = require("inversify");
const inversify_config_1 = __importDefault(require("../infrastructure/inversify.config"));
const app_js_1 = require("../Auth/app/app.js");
const ExecptionMiddleware_1 = __importDefault(require("../middleware/ExecptionMiddleware"));
const app_1 = require("../Product/app/app");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const container = new inversify_1.Container();
(0, inversify_config_1.default)(container);
app.use(ExecptionMiddleware_1.default);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
container.get(app_js_1.UserController);
container.get(app_1.ProductController);
const rabbitmqService = container.get('RabbitMQServiceQueue1');
const rabbitmqService2 = container.get('RabbitMQServiceQueue2');
app.post('/api/queu1', (req, res) => {
    const requestData = req.body;
    const messageText = JSON.stringify(requestData);
    rabbitmqService.sendMessage(messageText, (error) => {
        if (error) {
            console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
            res.status(500).send('RabbitMQ hatası');
        }
        else {
            res.send('İstek alındı ve RabbitMQ\'ya iletiliyor.');
        }
    });
});
app.post('/api/queu2', (req, res) => {
    const requestData = req.body;
    const messageText = JSON.stringify(requestData);
    rabbitmqService2.sendMessage(messageText, (error) => {
        if (error) {
            console.error('RabbitMQ bağlantı veya gönderme hatası:', error);
            res.status(500).send('RabbitMQ hatası');
        }
        else {
            res.send('İstek alındı ve RabbitMQ\'ya iletiliyor.');
        }
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map