"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
class RabbitMQService {
    constructor(rabbitmqServer, queueName) {
        this.queueName = queueName;
        this.messageHandler = (_message) => { }; // Boş bir callback ile başlayın
        callback_api_1.default.connect(rabbitmqServer, (error, connection) => {
            if (error) {
                console.error('RabbitMQ bağlantı hatası:', error);
                return;
            }
            this.connection = connection;
            this.connection.createChannel((error, channel) => {
                if (error) {
                    console.error('RabbitMQ kanalı oluşturma hatası:', error);
                    connection.close();
                    return;
                }
                this.channel = channel;
                this.channel.assertQueue(this.queueName, { durable: false });
                console.log(`Listening for messages in ${this.queueName}...`);
                // Mesajları tüketmeye başla
                this.startConsumingMessages();
            });
        });
    }
    // Dışarıdan mesajları işleyecek bir callback'i kaydetmek için kullanılır
    onMessageReceived(callback) {
        this.messageHandler = callback;
    }
    startConsumingMessages() {
        if (!this.channel) {
            console.error('Kanal oluşturulmamış.');
            return;
        }
        this.channel.consume(this.queueName, (message) => {
            if (message) {
                const content = message.content.toString();
                // Mesaj işlemesini başlat
                this.messageHandler(content);
                // Mesaj işlendikten sonra, RabbitMQ'ya yanıt vermelisiniz.
                this.channel?.ack(message);
            }
        });
    }
    sendMessage(message, callback) {
        if (!this.channel) {
            console.error('Kanal oluşturulmamış.');
            callback('Kanal oluşturulmamış hatası');
            return;
        }
        this.channel.sendToQueue(this.queueName, Buffer.from(message));
        console.log('RabbitMQ\'ya istek gönderildi:', message);
        // İşlem tamamlandığında callback'i çağır
        callback(null); // Herhangi bir hata olmadığını belirtmek için null
    }
}
exports.RabbitMQService = RabbitMQService;
//# sourceMappingURL=RabbitMQService.js.map