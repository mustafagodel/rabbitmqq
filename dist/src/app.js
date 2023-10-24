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
const app_1 = require("./Auth/controller/app");
const ExecptionMiddleware_1 = __importDefault(require("./middleware/ExecptionMiddleware"));
const RabbitMQService_1 = require("./infrastructure/RabbitMQService");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const container = new inversify_1.Container();
(0, inversify_config_1.default)(container);
app.use(ExecptionMiddleware_1.default);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const userController = container.get(app_1.UserController);
const rabbitmqServiceQueue = new RabbitMQService_1.RabbitMQService('amqp://localhost', 'Queue');
const rabbitmqServiceQueue1 = new RabbitMQService_1.RabbitMQService('amqp://localhost', 'Queue1');
const rabbitmqServiceQueue2 = new RabbitMQService_1.RabbitMQService('amqp://localhost', 'Queue2');
app.post('/api', (req, res) => {
    const requestData = req.body;
    rabbitmqServiceQueue.sendMessage(requestData, (error) => {
        if (error) {
            console.error('RabbitMQ bağlantı veya gönderme hatası (Queue):', error);
            res.status(500).send('RabbitMQ hatası (Queue)');
        }
        else {
            res.send('İstek alındı ve RabbitMQ\'ya (Queue) iletiliyor.');
        }
    });
});
app.post('/api/queu1', (req, res) => {
    const requestData1 = req.body;
    rabbitmqServiceQueue1.sendMessage(requestData1, (error) => {
        if (error) {
            console.error('RabbitMQ bağlantı veya gönderme hatası (Queue1):', error);
            res.status(500).send('RabbitMQ hatası (Queue1)');
        }
        else {
            res.send('İstek alındı ve RabbitMQ\'ya (Queue1) iletiliyor.');
        }
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map