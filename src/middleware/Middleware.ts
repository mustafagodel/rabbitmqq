import { Request, Response, NextFunction } from 'express';
const Middleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        next();
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Something went error: ' + error.message });
        }
    }
}
export default Middleware;