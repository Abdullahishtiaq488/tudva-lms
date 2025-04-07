// src/routes/booking.routes.ts
import express from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createBookingSchema } from '../validation/booking.validation';
import { UserRole } from '../models/User.model'; // Import UserRole

const router = express.Router();

router.post('/', authenticate, validate(createBookingSchema), bookingController.createBooking);
router.delete('/:bookingId', authenticate, bookingController.cancelBooking);
router.get('/user', authenticate, bookingController.getBookingsForUser);
router.get('/admin/statistics', authenticate, authorize([UserRole.Admin]), bookingController.getBookingStatistics);

export default router;