import express from 'express';
import * as seminarDayController from '../controllers/seminarDay.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// All routes in this file are protected and require admin role
router.post('/', authenticate, authorize([UserRole.Admin]), seminarDayController.createSeminarDay);
router.put('/:id', authenticate, authorize([UserRole.Admin]), seminarDayController.updateSeminarDay);
router.get('/', authenticate, authorize([UserRole.Admin]), seminarDayController.getAllSeminarDays);
router.delete('/:id', authenticate, authorize([UserRole.Admin]), seminarDayController.deactivateSeminarDay);
router.post('/:id/slots', authenticate, authorize([UserRole.Admin]), seminarDayController.createSlot); // id is seminarDayId
router.put('/slots/:id', authenticate, authorize([UserRole.Admin]), seminarDayController.updateSlot); // id is slotId
router.delete('/slots/:id', authenticate, authorize([UserRole.Admin]), seminarDayController.deactivateSlot);

export default router;