// src/controllers/userProgress.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as userProgressService from '../services/userProgress.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler.middleware';

export const trackProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { courseId, moduleId, completed, progressPercentage } = req.body;

        if (!courseId || !moduleId) {
            throw new AppError("Course ID and module ID are required", 400);
        }

        const progress = await userProgressService.trackProgress(
            userId,
            courseId,
            moduleId,
            completed || false,
            progressPercentage || 0
        );

        res.status(200).json({
            success: true,
            message: "Progress tracked successfully",
            progress
        });
    } catch (error) {
        next(error);
    }
};

export const getCourseProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { courseId } = req.params;

        if (!courseId) {
            throw new AppError("Course ID is required", 400);
        }

        const progress = await userProgressService.getCourseProgress(userId, courseId);

        res.status(200).json({
            success: true,
            progress
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUserProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        
        const progress = await userProgressService.getAllUserProgress(userId);

        res.status(200).json({
            success: true,
            progress
        });
    } catch (error) {
        next(error);
    }
};
