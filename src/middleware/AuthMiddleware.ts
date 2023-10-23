import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


    declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
const Outmiddleware = (req: Request, res: Response, next: NextFunction) => {
    const secretKey = process.env.SECRET_KEY;
    try {
     
        const token = req.headers.authorization;

        if (!token) {
            res.status(401).json({ message: 'Authentication failed' });
            return;
        }
        
        try {
            if (!secretKey) {
                console.error('SECRET_KEY is missing or undefined.');
                return;
            }
            const decodedToken = jwt.verify(token, secretKey);
            req.user = decodedToken;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Authentication failed' });
        }
        
        next(); 
    } catch (error) {
        if (error instanceof Error) {
            console.error('Hata:', error);
            res.status(500).json({ message: 'Something went error:' + error.message });
        }
    }
};

export default Outmiddleware;
