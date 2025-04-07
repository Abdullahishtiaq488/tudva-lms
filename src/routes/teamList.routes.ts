import express from 'express';
import * as teamListController from '../controllers/teamList.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// Example: Create a new list (assuming you have a boardId)
router.post('/', authenticate, /* authorize if needed */ teamListController.createTeamList);
router.put('/:id', authenticate, teamListController.updateTeamList);
router.get('/board/:boardId', authenticate, teamListController.getTeamLists); // Get lists for a board
// Add routes for deleting, etc.

export default router;