import amqplib from 'amqplib/callback_api';

export class RabbitMQService {
    private connection: amqplib.Connection | undefined;
    private channel: amqplib.Channel | undefined;
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

                this.startConsumingMessages();
            });
        });
    }

   
    public onMessageReceived(callback: (message: string) => void) {
        this.messageHandler = callback;
    }

    private startConsumingMessages() {
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

    public sendMessage(message: string, callback: (error: any) => void) {
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
