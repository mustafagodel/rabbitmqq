import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib/callback_api';
import { injectable } from 'inversify';

@injectable()
export class RabbitMQHandler {
    private connectionPromise: Promise<Connection>;
    private channelPromise: Promise<Channel>;
    private consumerTags: { [queueName: string]: string } = {};
    constructor() {
        this.connectionPromise = new Promise((resolve, reject) => {
            amqplib.connect(process.env.RABBITMQ_URL!, (error, connection) => {
                if (error) reject(error);
                else resolve(connection);
            });
        });

        this.channelPromise = this.connectionPromise.then((connection) =>
            new Promise((resolve, reject) => {
                connection.createChannel((error, channel) => {
                    if (error) reject(error);
                    else resolve(channel);
                });
            })
        );
    }

    async listenForMessages(queueName: string, handleMessage: (data: any, channel: Channel) => void): Promise<string> {
        const channel = await this.channelPromise;
        channel.assertQueue(queueName, { durable: false });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queueName);
        return new Promise<string>((resolve, reject) => {
            channel.consume(queueName, async (msg) => {
                if (msg !== null) {
                    try {
                        handleMessage(msg, channel);
                        channel.ack(msg); 
                    } catch (error) {
                        console.error("Error processing message:", error);
                        channel.reject(msg, false);
                    }
                }
            }, { noAck: false }, (error, { consumerTag }) => {
                if (error) reject(error);
                else resolve(consumerTag);
            });
        });
    }
    
    async sendRabbitMQ(queueName: string, data: any) {
        const channel = await this.channelPromise;
        channel.assertQueue(queueName, { durable: false });
        channel.sendToQueue(queueName, Buffer.from(data));
        console.log(" [x] Sent %s", data);
    }
   
}


