import express from 'express';
import * as courseController from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCourseSchema } from '../validation/course.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

// Create course route
router.post('/',
    authenticate,
    authorize([UserRole.Instructor, UserRole.Admin]),
    courseController.createCourse
);

// Get all courses (public)
router.get('/', courseController.getCourses);

// Get course by ID
router.get('/:courseId', courseController.getCourseById);

// Update course
router.put('/:courseId',
    authenticate,
    authorize([UserRole.Instructor, UserRole.Admin]),
    courseController.updateCourse
);

// Get modules for course
router.get('/:courseId/modules', courseController.getModulesForCourse);

// Admin routes
router.get('/admin/all',
    authenticate,
    authorize([UserRole.Admin]),
    courseController.getAllCoursesAdmin
);

// Delete course
router.delete('/:courseId',
    authenticate,
    authorize([UserRole.Admin]),
    courseController.deleteCourse
);

export default router;