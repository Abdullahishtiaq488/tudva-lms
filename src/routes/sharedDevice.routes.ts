import express from 'express';
import * as sharedDeviceController from '../controllers/sharedDevice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// Only training room admins (or specific roles) should be able to initiate shared device login.
router.post('/login', authenticate, authorize([UserRole.TrainingRoomAdmin]), sharedDeviceController.login);

export default router;