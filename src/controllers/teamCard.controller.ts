import { Request, Response } from 'express';  // Corrected import
import * as teamCardService from '../services/teamCard.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTeamCard = async (req: AuthRequest, res: Response) => {
  try {
     const { listId, title, description, assignedUserIds, cardOrder, dueDate } = req.body; // Added dueDate.
     const result = await teamCardService.createTeamCard(listId, title, description, assignedUserIds, cardOrder, dueDate); //Added dueDate
      res.status(201).json(result);
  }
  catch(error: any){
    res.status(error.statusCode || 500).json({success: false, error: error.message});
  }
};
export const updateTeamCard = async (req: AuthRequest, res: Response) => {
    try{
        const {id} = req.params;
        const updates = req.body;
        const result = await teamCardService.updateTeamCard(id, updates);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({success: false, error: error.message});
    }
}

export const moveTeamCard = async (req: AuthRequest, res: Response) => {
  try{
    const {cardId} = req.params;
    const {newListId, newCardOrder} = req.body;
    const result = await teamCardService.moveTeamCard(cardId, newListId, newCardOrder);
    res.status(200).json(result);
  }
  catch(error: any){
    res.status(error.statusCode || 500).json({success: false, error: error.message});
  }
}

export const addCommentToCard = async (req: AuthRequest, res: Response) => {
  try{
    const {cardId} = req.params;
    const {content} = req.body;
    const userId = req.user!.userId;
    const result = await teamCardService.addCommentToCard(cardId, userId, content);
    res.status(201).json(result);

  }
  catch(error: any){
    res.status(error.statusCode || 500).json({success: false, error: error.message});
  }
}

// ... other controller functions (get, delete, add/remove assigned users, etc.)