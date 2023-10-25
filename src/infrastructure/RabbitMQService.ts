import amqplib from 'amqplib/callback_api';
import { injectable } from 'inversify';

@injectable()
export class RabbitMQService {
    private static sharedChannel: amqplib.Channel | undefined;

    private queueName: string;
    private messageHandler: (message: string) => void;

    constructor(rabbitmqServer: string, queueName: string) {
        this.queueName = queueName;
        this.messageHandler = (_message: string) => {};

        if (!RabbitMQService.sharedChannel) {

            amqplib.connect(rabbitmqServer, (error, connection) => {
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

                    RabbitMQService.sharedChannel = channel;
                    channel.assertQueue(this.queueName, { durable: false });
                    console.log(`Listening for messages in ${this.queueName}...`);
                    this.startConsumingMessages(channel);
                });
            });
        } else {
            // If the shared channel already exists, use it
            this.startConsumingMessages(RabbitMQService.sharedChannel);
        }
    }

    public onMessageReceived(callback: (message: string) => void) {
        this.messageHandler = callback;
    }

    private startConsumingMessages(channel: amqplib.Channel) {
        channel.consume(this.queueName, (message) => {
            if (message) {
                const content = message.content.toString();
                this.messageHandler(content);
                channel.ack(message);
            }
        });
    }

    public sendMessage(message: string, callback: (error: any) => void) {
        if (!RabbitMQService.sharedChannel) {
            console.error('Kanal oluşturulmamış.');
            callback('Kanal oluşturulmamış hatası');
            return;
        }

        RabbitMQService.sharedChannel.sendToQueue(this.queueName, Buffer.from(message));
        console.log('RabbitMQ\'ya istek gönderildi:', message);
        callback(null);
    }
}
