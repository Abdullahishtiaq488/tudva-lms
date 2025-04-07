// src/controllers/teamBoard.controller.ts
import { Request, Response, NextFunction } from 'express'; // Import NextFunction
import * as teamBoardService from '../services/teamBoard.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTeamBoard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, description } = req.body;
        const userId = req.user!.userId; // Get user ID from JWT
        const result = await teamBoardService.createTeamBoard(title, description, userId);
        res.status(201).json(result);
    } catch (error) {
        next(error); // Pass error to error handler
    }
};

export const getAllTeamBoards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await teamBoardService.getAllTeamBoards();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getTeamBoardById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { boardId } = req.params;
        const result = await teamBoardService.getTeamBoardById(boardId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const searchCards = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { boardId } = req.params;
        const { query, assignedUserId, listId, dueDateStatus } = req.query;

        // Type checking and conversion for query parameters
        const queryStr = typeof query === 'string' ? query : undefined;
        const assignedUserIdStr = typeof assignedUserId === 'string' ? assignedUserId : undefined;
        const listIdStr = typeof listId === 'string' ? listId : undefined;
        const dueDateStatusStr = typeof dueDateStatus === 'string' ? dueDateStatus : undefined;

        // Validate dueDateStatus
        if (dueDateStatusStr && !["overdue", "upcoming", "none"].includes(dueDateStatusStr)) {
            return next(new Error("Invalid dueDateStatus value.")); // Use next() here
        }

        const result = await teamBoardService.searchCards(
            boardId,
            queryStr,
            assignedUserIdStr,
            listIdStr,
            dueDateStatusStr as "overdue" | "upcoming" | "none" | undefined // Type assertion
        );
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Add updateTeamBoard, deleteTeamBoard, etc., as needed.