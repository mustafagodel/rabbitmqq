import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { MongoDBConnector } from '../infrastructure/db';
import { ClientSession } from 'mongodb';
import { inject, injectable } from 'inversify';
import { RabbitMQProvider } from '../infrastructure/RabbitMQProvider';
import { Aggregator } from '../infrastructure/Aggregator';

declare module 'express' {
    interface Request {
        dbSession?: ClientSession;
    }
}

interface MicroserviceConfig {
    name: string;
    actionMessage: string;
}

interface RouteConfig {
    action: string;
    microservices?: MicroserviceConfig[];
}

interface RoutesConfig {
    routes: RouteConfig[];
}

@injectable()
class ExceptionMiddleware {
    private readonly aggregator: Aggregator;
    private routesConfig: RoutesConfig = { routes: [] };

    // Inject Aggregator into the constructor
    constructor(@inject(Aggregator) aggregator: Aggregator,   @inject('AggregatorRabbitMQProviderQueue') private aggregatorRabbitMQProviderQueue: RabbitMQProvider,) {
        this.aggregator = aggregator;
        this.loadRoutes();
        this.aggregatorRabbitMQProviderQueue=aggregatorRabbitMQProviderQueue;
      
    }

    async startSaga(req: Request, res: Response, next: NextFunction) {
        const connector = new MongoDBConnector();
        let session: ClientSession | null = null;

        try {
            await connector.connect();
            session = await connector.startTransaction();
            req.dbSession = session;

            const messageData = req.body;
            

            await connector.commitTransaction(session);
            console.log('SagaMiddleware: İşlem tamamlandı.');
        } catch (error: any) {
            if (session) {
                if (error instanceof Error) {
                    if (process.uptime() < 1) {
                        console.error('Transaction rolled back due to a system shutdown:', error);
                        process.exit(1);
                    } else {
                        console.error('Transaction rolled back due to an error:', error);
                    }
                }
            }
            res.status(500).json({ message: 'SagaMiddleware: MongoDB transaction error: ' + error.message });
            console.error('SagaMiddleware: Hata:', error);
        } finally {
            if (session) {
                session.endSession();
            }
            next();
        }
    }

    private loadRoutes() {
        try {
            if (fs.existsSync('routes.json')) {
                const rawData = fs.readFileSync('routes.json');
                this.routesConfig = JSON.parse(rawData.toString());
                console.log('Routes loaded successfully.');
            } else {
                console.error('Error: File "routes.json" does not exist.');
            }
        } catch (error) {
            console.error('Error loading routes:', error);
        }
    }
}

export default ExceptionMiddleware;
