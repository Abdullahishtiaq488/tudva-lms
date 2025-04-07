import express from 'express';
import * as teamCardController from '../controllers/teamCard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.post('/', authenticate, teamCardController.createTeamCard);
router.put('/:id', authenticate, teamCardController.updateTeamCard);
router.patch('/:cardId/move', authenticate, teamCardController.moveTeamCard);
router.post('/:cardId/comments', authenticate, teamCardController.addCommentToCard);
// Add routes for getting, deleting, assigning users, etc.

export default router;