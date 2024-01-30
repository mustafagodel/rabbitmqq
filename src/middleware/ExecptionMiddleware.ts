declare module 'express' {
    interface Request {
        dbSession?: ClientSession;
    }
}

import { Request, Response, NextFunction } from 'express';
import { MongoDBConnector } from '../infrastructure/db';
import { ClientSession } from 'mongodb';

class ExceptionMiddleware {
    static async startSaga(req: Request, res: Response, next: NextFunction) {
        const connector = new MongoDBConnector();
        let session: ClientSession | null = null;

        try {
            await connector.connect();
            session = await connector.startTransaction();
            req.dbSession = session;

            if (res.locals && res.locals.errorOccurred) {
                await connector.abortTransaction(session);
                process.exit(1);
            } else {
                await connector.commitTransaction(session);
            }

            console.log('SagaMiddleware: İşlem tamamlandı.');

            next();
        } catch (error: any) {
            if (session) {
                await connector.abortTransaction(session);
            }
            res.status(500).json({ message: 'SagaMiddleware: MongoDB transaction error: ' + error.message });
            process.exit(1);
        }
    }
}

export default ExceptionMiddleware;

