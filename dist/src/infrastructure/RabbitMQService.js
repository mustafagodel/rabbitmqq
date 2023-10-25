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
var RabbitMQService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const inversify_1 = require("inversify");
let RabbitMQService = RabbitMQService_1 = class RabbitMQService {
    constructor(rabbitmqServer, queueName) {
        this.queueName = queueName;
        this.messageHandler = (_message) => { };
        if (!RabbitMQService_1.sharedChannel) {
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
                    RabbitMQService_1.sharedChannel = channel;
                    channel.assertQueue(this.queueName, { durable: false });
                    console.log(`Listening for messages in ${this.queueName}...`);
                    this.startConsumingMessages(channel);
                });
            });
        }
        else {
            // If the shared channel already exists, use it
            this.startConsumingMessages(RabbitMQService_1.sharedChannel);
        }
    }
    onMessageReceived(callback) {
        this.messageHandler = callback;
    }
    startConsumingMessages(channel) {
        channel.consume(this.queueName, (message) => {
            if (message) {
                const content = message.content.toString();
                this.messageHandler(content);
                channel.ack(message);
            }
        });
    }
    sendMessage(message, callback) {
        if (!RabbitMQService_1.sharedChannel) {
            console.error('Kanal oluşturulmamış.');
            callback('Kanal oluşturulmamış hatası');
            return;
        }
        RabbitMQService_1.sharedChannel.sendToQueue(this.queueName, Buffer.from(message));
        console.log('RabbitMQ\'ya istek gönderildi:', message);
        callback(null);
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = RabbitMQService_1 = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [String, String])
], RabbitMQService);
//# sourceMappingURL=RabbitMQService.js.map