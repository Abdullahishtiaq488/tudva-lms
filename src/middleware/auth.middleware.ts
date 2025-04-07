// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';
import { AppError } from './errorHandler.middleware';
import { supabase } from '../utils/supabaseClient';

interface AuthRequest extends Request {
    user?: { userId: string; role: UserRole }; // Use UserRole here
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError('Authorization header missing.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Token missing.', 401));
    }

    try {
        // Verify the token with Supabase
        const { data: userData, error: userError } = await supabase.auth.getUser(token);

        if (userError || !userData.user) {
            return next(new AppError('Invalid token.', 401));
        }

        // Extract user metadata
        const user = userData.user;
        const metadata = user.user_metadata || {};
        const role = metadata.role || 'learner';

        // Set user data in request
        req.user = {
            userId: user.id,
            role: role as UserRole
        };

        next();
    } catch (error) {
        return next(new AppError('Invalid token.', 401));
    }
};

const authorize = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Not authenticated.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Forbidden: Insufficient privileges.', 403));
        }

        next();
    };
};

export { AuthRequest, authenticate, authorize };