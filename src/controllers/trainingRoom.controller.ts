// src/controllers/trainingRoom.controller.ts
import { Request, Response, NextFunction } from 'express'; // Import NextFunction
import * as trainingRoomService from '../services/trainingRoom.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => { // Add NextFunction and return type
    try {
        const { institutionName, contactEmail, contactPhone, address } = req.body;
        // Add more parameters as needed
        const result = await trainingRoomService.registerTrainingRoom(institutionName, contactEmail, contactPhone, address);
        res.status(201).json(result);
    } catch (error) {
        next(error); // Pass error to error handler
    }
};