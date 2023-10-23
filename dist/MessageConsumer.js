"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAmqpChannel = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
function createAmqpChannel() {
    return new Promise((resolve, reject) => {
        const amqpURL = 'amqp://localhost';
        callback_api_1.default.connect(amqpURL, (error0, connection) => {
            if (error0) {
                reject(error0);
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    reject(error1);
                }
                resolve(channel);
            });
        });
    });
}
exports.createAmqpChannel = createAmqpChannel;
//# sourceMappingURL=MessageConsumer.js.map