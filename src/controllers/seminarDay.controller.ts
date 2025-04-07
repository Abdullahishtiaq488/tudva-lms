// src/controllers/seminarDay.controller.ts
import { Request, Response, NextFunction } from 'express'; // Import NextFunction
import * as seminarDayService from '../services/seminarDay.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler.middleware'; // Import

export const createSeminarDay = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization is handled by the middleware now, so remove the redundant check:
        // if (req.user!.role !== 'admin') { ... }

        const { weekday, isActive, description } = req.body;
        const result = await seminarDayService.createSeminarDay(weekday, isActive, description);
        res.status(201).json(result);
    } catch (error) {
        next(error); // Pass the error to the error handler
    }
};

export const updateSeminarDay = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization handled by middleware
        const { id } = req.params;
        const updates = req.body;
        const result = await seminarDayService.updateSeminarDay(id, updates);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getAllSeminarDays = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization handled by middleware
        const result = await seminarDayService.getAllSeminarDays();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deactivateSeminarDay = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization handled by middleware
        const { id } = req.params;
        const result = await seminarDayService.deactivateSeminarDay(id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const createSlot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization handled by middleware
        const { seminarDayId, startTime, endTime, isActive } = req.body;
        const result = await seminarDayService.createSlot(seminarDayId, startTime, endTime, isActive);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateSlot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization handled by middleware
        const { id } = req.params;
        const updates = req.body;
        const result = await seminarDayService.updateSlot(id, updates);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deactivateSlot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authorization handled by middleware
        const { id } = req.params;
        const result = await seminarDayService.deactivateSlot(id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};