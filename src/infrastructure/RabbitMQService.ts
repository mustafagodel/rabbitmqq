import amqp from 'amqplib/callback_api';

export class RabbitMQService {
    onMessageReceived(arg0: (message: string) => void) {
        throw new Error('Method not implemented.');
    }
 
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;
    private queueName: string;

    constructor(rabbitmqServer: string, queueName: string) {
        this.queueName = queueName;
        amqp.connect(rabbitmqServer, (error, connection) => {
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
                this.channel.assertQueue(this.queueName, { durable: false });
                console.log(`Listening for messages in ${this.queueName}...`);
            });
        });
    }
  
    public sendMessage(message: string, callback: (error: any) => void) {
        this.channel?.sendToQueue(this.queueName, Buffer.from(message));
        console.log('RabbitMQ\'ya istek gönderildi:', message);
    
        // İşlem tamamlandığında callback'i çağır
        callback(null); // Herhangi bir hata olmadığını belirtmek için null
    }

    // Diğer RabbitMQ ile ilgili işlemler burada olabilir.
}