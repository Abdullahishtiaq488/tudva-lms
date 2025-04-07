import express from 'express';
import * as trainingRoomController from '../controllers/trainingRoom.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// For now, let's assume only admins can register training rooms.  We can adjust this later.
router.post('/register', authenticate, authorize([UserRole.Admin]), trainingRoomController.register);

export default router;