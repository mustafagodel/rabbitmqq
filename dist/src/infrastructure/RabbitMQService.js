"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
class RabbitMQService {
    onMessageReceived(arg0) {
        throw new Error('Method not implemented.');
    }
    constructor(rabbitmqServer, queueName) {
        this.queueName = queueName;
        callback_api_1.default.connect(rabbitmqServer, (error, connection) => {
            if (error) {
                console.error('RabbitMQ bağlantı hatası:', error);
                return;
            }
            connection.createChannel((error, channel) => {
                if (error) {
                    console.error('RabbitMQ kanalı oluşturma hatası:', error);
                    connection.close();
                    return;
                }
                this.channel = channel;
                this.channel.assertQueue(this.queueName, { durable: false });
                console.log(`Listening for messages in ${this.queueName}...`);
            });
        });
    }
    sendMessage(message, callback) {
        this.channel?.sendToQueue(this.queueName, Buffer.from(message));
        console.log('RabbitMQ\'ya istek gönderildi:', message);
        // İşlem tamamlandığında callback'i çağır
        callback(null); // Herhangi bir hata olmadığını belirtmek için null
    }
}
exports.RabbitMQService = RabbitMQService;
//# sourceMappingURL=RabbitMQService.js.map