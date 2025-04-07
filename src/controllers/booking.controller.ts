// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler.middleware';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { courseId, selectedSlots } = req.body;
        const deviceId = req.headers['x-device-id'] as string | undefined; // Get deviceId from header

        // const result = await bookingService.createBooking(userId, courseId, selectedSlots, deviceId); // Pass deviceId
        // res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { bookingId } = req.params;

        // const result = await bookingService.cancelBooking(userId, bookingId);
        // res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getBookingsForUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        // const result = await bookingService.getBookingsForUser(userId);
        // res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getBookingStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // const result = await bookingService.getBookingStatistics();
        // res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};