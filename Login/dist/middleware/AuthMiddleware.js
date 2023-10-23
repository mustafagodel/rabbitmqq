"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Outmiddleware = (req, res, next) => {
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
            const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
            req.user = decodedToken;
            next();
        }
        catch (error) {
            res.status(401).json({ message: 'Authentication failed' });
        }
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Hata:', error);
            res.status(500).json({ message: 'Something went error:' + error.message });
        }
    }
};
exports.default = Outmiddleware;
//# sourceMappingURL=AuthMiddleware.js.map