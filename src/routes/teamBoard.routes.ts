import express from 'express';
import * as teamBoardController from '../controllers/teamBoard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// Only admins and instructors can create boards.
router.post('/', authenticate, authorize([UserRole.Admin, UserRole.Instructor]), teamBoardController.createTeamBoard);
router.get('/', authenticate, teamBoardController.getAllTeamBoards); // Everyone logged in can see.
router.get('/:boardId', authenticate, teamBoardController.getTeamBoardById); //Everyone logged in can see.
router.get('/:boardId/search', authenticate, teamBoardController.searchCards); // Add the search route
// Add routes for updating, deleting, etc., with appropriate authorization.

export default router;