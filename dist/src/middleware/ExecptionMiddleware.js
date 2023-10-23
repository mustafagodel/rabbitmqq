"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Middleware = (req, res, next) => {
    try {
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Something went error: ' + error.message });
        }
    }
};
exports.default = Middleware;
//# sourceMappingURL=ExecptionMiddleware.js.map