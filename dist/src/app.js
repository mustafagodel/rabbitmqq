"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const body_parser_1 = __importDefault(require("body-parser"));
const inversify_1 = require("inversify");
const inversify_config_1 = __importDefault(require("./infrastructure/inversify.config"));
const app_js_1 = require("./Login/controller/app.js");
const ExecptionMiddleware_1 = __importDefault(require("./middleware/ExecptionMiddleware"));
const RabbitMQService_1 = require("./infrastructure/RabbitMQService"); // Yeni ekledik
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const container = new inversify_1.Container();
(0, inversify_config_1.default)(container);
app.use(ExecptionMiddleware_1.default);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('dist'));
const userController = container.get(app_js_1.UserController);
const rabbitmqService = new RabbitMQService_1.RabbitMQService('amqp://localhost', 'Queue'); // RabbitMQ servisi
rabbitmqService.onMessageReceived((message) => {
    userController.handleMessage1(message);
});
app.post('/other', (req, res) => {
    const requestData = req.body;
    const messageText = JSON.stringify(requestData); // JSON verisini dizeye dönüştür
    // RabbitMQ servisine isteği gönder
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map