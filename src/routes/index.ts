import express from 'express';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import bookingRoutes from './booking.routes';
import trainingRoomRoutes from './trainingRoom.routes';
import sharedDeviceRoutes from './sharedDevice.routes';
import seminarDayRoutes from './seminarDay.routes';
import teamBoardRoutes from './teamBoard.routes';
import teamListRoutes from './teamList.routes';
import teamCardRoutes from './teamCard.routes';
// import userProgressRoutes from './userProgress.routes';
// import testRoutes from './test.routes';

const router = express.Router();

// // router.use('/test', testRoutes); // Add test routes first for easy access
router.use('/user', userRoutes);
router.use('/courses', courseRoutes);
router.use('/bookings', bookingRoutes);
router.use('/training-rooms', trainingRoomRoutes);
router.use('/shared-device', sharedDeviceRoutes);
router.use('/seminar-days', seminarDayRoutes);
router.use('/team-boards', teamBoardRoutes);
router.use('/team-lists', teamListRoutes);
router.use('/team-cards', teamCardRoutes);
// router.use('/user-progress', userProgressRoutes);

export default router;