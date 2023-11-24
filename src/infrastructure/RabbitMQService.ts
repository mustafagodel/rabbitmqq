import amqplib from 'amqplib/callback_api';
import { injectable } from 'inversify';

@injectable()
export class RabbitMQService {
    private channel: amqplib.Channel | undefined;
    private isConsuming: boolean = false;
    private queueName: string;
    private messageHandler: (message: string) => void;
    private consumerTag: string | undefined;

    constructor(rabbitmqServer: string, queueName: string) {
        this.queueName = queueName;
        this.messageHandler = (_message: string) => {};
        this.consumerTag = undefined;

        amqplib.connect(rabbitmqServer, (error, connection) => {
            if (error) {
                console.error('RabbitMQ connection error:', error);
                return;
            }

            connection.createChannel((error, channel) => {
                if (error) {
                    console.error('RabbitMQ channel creation error:', error);
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

    public removeMessageListener() {
        if (this.consumerTag && this.channel) {
            this.channel.cancel(this.consumerTag);
            this.consumerTag = undefined;
            console.log('Message listener removed.');
        }
    }

    private startConsumingMessages(channel: amqplib.Channel) {
        if (this.isConsuming) {
            console.log('Already processing the messages.');
            return;
        }
        this.isConsuming = true;

        channel.consume(this.queueName, (message) => {
            if (message) {
                const content = message.content.toString();
                this.messageHandler(content);
                channel.ack(message);

                if (content === 'stopConsuming') {
                    console.log('Stopping message consumption.');
                    this.isConsuming = false;
                    this.removeMessageListener();
                   
                }
            }
        });
    }

    public sendMessage(message: string, callback: (error: any) => void) {
        if (!this.channel) {
            console.error('The channel has not been created.');
            callback('The channel has not been created error');
            return;
        }

        this.channel.sendToQueue(this.queueName, Buffer.from(message));
        console.log('The request was received sent RabbitMQ', message);
        callback(null);
    }

    public closeChannel() {
        if (this.channel) {
            this.channel.close((error) => {
                if (error) {
                    console.error('Error closing RabbitMQ channel:', error);
                } else {
                    console.log('RabbitMQ channel closed.');
                    this.isConsuming = false;
                }
            });
        }
    }
}
