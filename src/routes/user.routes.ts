import express from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
    registerSchema,
    loginSchema,
    updateUserProfileSchema,
    // updateUserRoleSchema
} from '../validation/user.validation';
import { loginLimiter, passwordResetLimiter, generalLimiter } from '../middleware/rateLimit.middleware'; // Import
import { UserRole } from '../models/User.model';


const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), loginLimiter, userController.login); // Apply loginLimiter
router.get('/confirm', userController.confirmEmail);
router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);
router.delete('/:userId', authenticate, authorize([UserRole.Admin]), userController.deleteUser); // New route, protected
// router.put('/:userId/role', authenticate, authorize([UserRole.Admin]), validate(updateUserRoleSchema), userController.updateUserRole); // New route
router.post('/request-password-reset', passwordResetLimiter, userController.requestPasswordReset); // Apply passwordResetLimiter
router.get('/verify-reset-token', userController.verifyResetToken);
router.post('/reset-password', userController.resetPassword);
router.get('/all', authenticate, authorize([UserRole.Admin]), userController.getAllUsers); // New, protected route
// TODO: Uncomment these routes once the controllers are properly implemented
// router.get('/dashboard/stats', authenticate, userController.getDashboardStats);
// router.get('/enrolled-courses', authenticate, userController.getEnrolledCourses);

export default router;