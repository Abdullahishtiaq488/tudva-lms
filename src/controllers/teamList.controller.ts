import { Request, Response } from 'express';  // Corrected import
import * as teamListService from '../services/teamList.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTeamList = async (req: AuthRequest, res: Response) => {
    try{
        const {boardId, title, listOrder} = req.body;
        const result = await teamListService.createTeamList(boardId, title, listOrder);
        res.status(201).json(result);
    }
    catch(error: any){
        res.status(error.statusCode || 500).json({success: false, error: error.message});
    }
};
export const updateTeamList = async (req: AuthRequest, res: Response) => {
    try{
        const {id} = req.params;
        const updates = req.body;
        const result = await teamListService.updateTeamList(id, updates);
        res.status(200).json(result);

    }
    catch(error: any){
        res.status(error.statusCode || 500).json({success: false, error: error.message});
    }
  };

export const getTeamLists = async (req: AuthRequest, res: Response) => {
    try{
        const {boardId} = req.params;
        const result = await teamListService.getTeamLists(boardId);
        res.status(200).json(result);
    }
    catch(error: any){
        res.status(error.statusCode || 500).json({success: false, error: error.message});
    }
}

// ... other controller functions (update, delete) ...