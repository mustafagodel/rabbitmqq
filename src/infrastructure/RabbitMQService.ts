import amqplib from 'amqplib/callback_api';
import { injectable } from 'inversify';

@injectable()
export class RabbitMQService {
    private channel: amqplib.Channel | undefined;
    private isConsuming: boolean = false; 

    private queueName: string;
    private messageHandler: (message: string) => void;

    constructor(rabbitmqServer: string, queueName: string) {
        this.queueName = queueName;
        this.messageHandler = (_message: string) => {};

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

                this.channel = channel;
                channel.assertQueue(this.queueName, { durable: false });
                console.log(`Listening for messages in ${this.queueName}...`);
                this.startConsumingMessages(channel);
            });
        });
    }

    public onMessageReceived(callback: (message: string) => void) {
        this.messageHandler = callback;
    }

    private startConsumingMessages(channel: amqplib.Channel) {
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

    public sendMessage(message: string, callback: (error: any) => void) {
        if (!this.channel) {
            console.error('Kanal oluşturulmamış.');
            callback('Kanal oluşturulmamış hatası');
            return;
        }

        this.channel.sendToQueue(this.queueName, Buffer.from(message));
        console.log('RabbitMQ\'ya istek gönderildi:', message);
        callback(null);
    }
}
