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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const inversify_1 = require("inversify");
let RabbitMQService = class RabbitMQService {
    constructor(rabbitmqServer, queueName) {
        this.isConsuming = false; // İşlemcinin aktif olduğunu gösteren bayrak
        this.queueName = queueName;
        this.messageHandler = (_message) => { };
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
                channel.assertQueue(this.queueName, { durable: false });
                console.log(`Listening for messages in ${this.queueName}...`);
                this.startConsumingMessages(channel);
            });
        });
    }
    onMessageReceived(callback) {
        this.messageHandler = callback;
    }
    startConsumingMessages(channel) {
        if (this.isConsuming) {
            console.log('Zaten mesajları işliyor.');
            return;
        }
        this.isConsuming = true;
        channel.consume(this.queueName, (message) => {
            if (message) {
                const content = message.content.toString();
                this.messageHandler(content);
                channel.ack(message);
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
        callback(null);
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [String, String])
], RabbitMQService);
//# sourceMappingURL=RabbitMQService.js.map