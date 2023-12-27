import amqplib, { Channel, Connection, Message } from 'amqplib/callback_api';
import { injectable } from 'inversify';

@injectable()
export class RabbitMQProvider {
    getChannel(): amqplib.Channel {
      throw new Error('Method not implemented.');
    }
    
    private connection: Connection | undefined;
    private channel: Channel | undefined;
    private queueName: string;
    private isConsuming: boolean = false;
    private messageHandler: (message: string) => void;

    private isConnectionCreated: boolean = false;

    constructor(rabbitmqServer: string, queueName: string) {
        this.queueName = queueName;
        this.messageHandler = (message: string) => {};

        this.createConnection(rabbitmqServer);
    }


    private createConnection(rabbitmqServer: string) {
        if (this.isConnectionCreated) {
            console.log('Connection already created.');
            return;
        }

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
                    this.closeChannel();
                    return;
                }

                this.channel = channel;
                channel.assertQueue(this.queueName, { durable: false });
                console.log(`Listening for messages in ${this.queueName}...`);
                this.startConsumingMessages(channel);

                this.isConnectionCreated = true;
            });
        });
    }
    public onMessageReceived(callback: (message: string) => void) {
        try {
            this.messageHandler = callback;
        } catch (error) {
            console.error('Error in onMessageReceived:', error);
        }
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

    public startConsumingMessages(channel: Channel) {
        if (!this.isConsuming) {
            channel.consume(this.queueName, (message: Message | null) => {
                if (message) {
                    const content = message.content.toString();
                    this.messageHandler(content);
                    channel.ack(message);
                }
                
            });
    
            this.isConsuming = true;
        }
    }

    public sendMessage(message: string, callback: (error: any) => void) {
        if (!this.channel) {
            console.error('The channel has not been created.');
            callback('The channel has not been created error');
            return;
        }

        this.channel.sendToQueue(this.queueName, Buffer.from(message));
        console.log('The request was sent to RabbitMQ', message);

    
        
        callback(null);
    }
}

