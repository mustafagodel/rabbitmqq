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
const UserController_1 = require("./controller/UserController");
const ExecptionMiddleware_1 = __importDefault(require("./middleware/ExecptionMiddleware"));
const callback_api_1 = __importDefault(require("amqplib/callback_api")); // amqplib'yi içe aktarın
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const container = new inversify_1.Container();
(0, inversify_config_1.default)(container);
app.use(ExecptionMiddleware_1.default);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const userController = container.get(UserController_1.UserController);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.post('/api', (req, res) => {
    const requestData = req.body;
    const rabbitmqServer = 'amqp://localhost';
    const queueName = 'Queue';
    callback_api_1.default.connect(rabbitmqServer, (error, connection) => {
        if (error) {
            console.error('RabbitMQ bağlantı hatası:', error);
            res.status(500).send('RabbitMQ bağlantı hatası');
            return;
        }
        connection.createChannel((error, channel) => {
            if (error) {
                console.error('RabbitMQ kanalı oluşturma hatası:', error);
                res.status(500).send('RabbitMQ kanalı oluşturma hatası');
                connection.close();
                return;
            }
            channel.assertQueue(queueName, { durable: false });
            const message = JSON.stringify(requestData);
            channel.sendToQueue(queueName, Buffer.from(message));
            console.log('RabbitMQ\'ya istek gönderildi:', message);
            res.send('İstek alındı ve RabbitMQ\'ya iletiliyor.');
            setTimeout(() => {
                connection.close();
            }, 500);
        });
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map