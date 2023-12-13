import amqplib, { Channel, Connection, Message } from 'amqplib/callback_api';
import { injectable } from 'inversify';

@injectable()
export class RabbitMQProvider {
    private connection: Connection | undefined;
    private channel: Channel | undefined;
    private queueName: string;
    private messageHandler: (message: string) => void;

    constructor(rabbitmqServer: string, queueName: string) {
        this.queueName = queueName;
        this.messageHandler = (_message: string) => {
            console.log('Message handler is set up.' + _message);
        };

        this.createConnection(rabbitmqServer);
    }

    private createConnection(rabbitmqServer: string) {
        amqplib.connect(rabbitmqServer, (error, connection) => {
            if (error) {
                console.error('RabbitMQ connection error:', error);
                return;
            }

            this.connection = connection;

            connection.createChannel((error, channel) => {
                if (error) {
                    console.error('RabbitMQ channel creation error:', error);
                    this.closeConnection();
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

    public closeConnection() {
        if (this.connection) {
            this.connection.close((error) => {
                if (error) {
                    console.error('Error closing RabbitMQ connection:', error);
                } else {
                    console.log('RabbitMQ connection closed.');
                }
            });
        }
    }

    public closeChannel() {
        if (this.channel) {
            this.channel.close((error) => {
                if (error) {
                    console.error('Error closing RabbitMQ channel:', error);
                } else {
                    console.log('RabbitMQ channel closed.');
                }
            });
        }
    }

    private startConsumingMessages(channel: Channel) {
        channel.consume(this.queueName, (message: Message | null) => {
            if (message) {
                const content = message.content.toString();
                this.messageHandler(content);
                channel.ack(message);
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
}
