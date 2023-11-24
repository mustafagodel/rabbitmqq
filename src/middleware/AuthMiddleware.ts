import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: any;
            body?:any;
        }
    }
}

const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const secretKey = process.env.SECRET_KEY;
  
    try {
         const requestData = req.body;
         if (requestData) {
            if (requestData.handler === 'login' || requestData.handler === 'register') {
                req.user = null;
                return next();
            }
        }
        const token = req.headers.authorization;
    
        if (!token) {
            res.status(401).json({ message: 'Authentication failed' });
            return;
        }
        try {
            if (!secretKey) {
                console.error('SECRET_KEY is missing or undefined.');
                return res.status(500).json({ message: 'Authentication failed' });
            }
       
            const tokenWithoutBearer = token.split(' ')[1];
            const decodedToken = jwt.verify(tokenWithoutBearer, secretKey);
            req.user = decodedToken;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Hata:', error);
            res.status(500).json({ message: 'Something went wrong: ' + error.message });
        }
    }
};

export default AuthMiddleware;
