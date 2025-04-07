import { Request, Response, NextFunction } from 'express';
import { QueryFailedError } from 'typeorm'; // Import TypeORM error
import logger from '../utils/logger'; // Import Winston logger
import { AuthRequest } from './auth.middleware'; // Import to get user.

// Custom error class for application-specific errors
class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

  const authReq = req as AuthRequest;
  const userId = authReq.user ? authReq.user.userId : 'anonymous'; // Get user ID if available
    
    // Log additional context with the error
    logger.error(`Error: ${err.message}`, {
        statusCode: err.statusCode || 500,
        stack: err.stack,
        requestMethod: req.method,
        requestUrl: req.url,
        userId: userId, // Log the user ID
    });


    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof QueryFailedError) { // Handle TypeORM errors
        statusCode = 400; // Usually a bad request (e.g., constraint violation)
        message = "Database error: " + err.message; // Provide more specific DB error

    }
     else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Invalid token.';
    } // Add more else if blocks for other known error types

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

export { errorHandler, AppError };