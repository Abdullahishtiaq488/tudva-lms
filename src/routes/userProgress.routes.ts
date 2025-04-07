// src/routes/userProgress.routes.ts
import express from 'express';
import * as userProgressController from '../controllers/userProgress.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes in this file require authentication
router.use(authenticate);

// Track progress for a module
router.post('/', userProgressController.trackProgress);

// Get progress for a specific course
router.get('/course/:courseId', userProgressController.getCourseProgress);

// Get all progress for the user
router.get('/', userProgressController.getAllUserProgress);

export default router;
