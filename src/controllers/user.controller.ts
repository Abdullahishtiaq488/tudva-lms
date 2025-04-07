// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../utils/supabaseClient';
import { AppError } from '../middleware/errorHandler.middleware';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('Registration request received');
        console.log('Request body:', req.body);

        // Handle both name and fullName fields for compatibility
        const { email, password, name, fullName, role } = req.body;
        const userName = fullName || name; // Use fullName if provided, otherwise use name

        console.log('Extracted fields:', { email, password: '***', userName, role });

        if (!email || !password || !userName) {
            console.log('Missing required fields');
            return next(new AppError('Email, password, and name are required', 400));
        }

        // Create user with Supabase Auth
        console.log('Creating user with Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: userName,
                    role: role || 'learner'
                }
            }
        });

        if (authError) {
            console.log('Error creating user with Supabase Auth:', authError);
            return next(new AppError(authError.message, 400));
        }

        console.log('User created with Supabase Auth:', authData ? 'success' : 'no data returned');

        // Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for confirmation.',
            user: {
                email,
                name: userName,
                role: role || 'learner'
            }
        });

        console.log('Registration completed successfully');
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        console.log('Login request received');
        console.log('Request body:', req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing required fields');
            return next(new AppError('Email and password are required', 400));
        }

        // Sign in with Supabase Auth
        console.log('Signing in with Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.log('Error signing in with Supabase Auth:', authError);

            // Special handling for email confirmation
            if (authError.message.includes('Email not confirmed')) {
                return res.status(401).json({
                    success: false,
                    message: 'Please confirm your email address before logging in',
                    needsEmailConfirmation: true
                });
            }

            return next(new AppError('Invalid credentials', 401));
        }

        console.log('User signed in with Supabase Auth:', authData ? 'success' : 'no data returned');

        // Get user metadata from the session
        const userData = authData.user.user_metadata || {};

        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: userData.name || email.split('@')[0],
                role: userData.role || 'learner'
            },
            token: authData.session.access_token
        });

        console.log('Login completed successfully');
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

export const confirmEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            return next(new AppError('Verification token is required', 400));
        }

        // Verify the token with Supabase
        const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
        });

        if (error) {
            return next(new AppError('Invalid or expired verification token', 400));
        }

        // Redirect to the frontend
        res.redirect('http://localhost:3000/login?verified=true');
    } catch (error) {
        console.error('Verification error:', error);
        next(error);
    }
}

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the token from the request
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new AppError('Token is required', 401));
        }

        // Get user data from the token
        const { data: userData, error: userError } = await supabase.auth.getUser(token);

        if (userError) {
            return next(new AppError('Invalid token', 401));
        }

        // Extract user metadata
        const user = userData.user;
        const metadata = user.user_metadata || {};

        // Return user profile
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: metadata.name || (user.email ? user.email.split('@')[0] : 'User'),
                role: metadata.role || 'learner',
                emailVerified: user.email_confirmed_at ? true : false
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        next(error);
    }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the token from the request
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new AppError('Token is required', 401));
        }

        const { fullName, password, currentPassword } = req.body;

        // Update user metadata if fullName is provided
        if (fullName) {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { name: fullName }
            });

            if (updateError) {
                return next(new AppError(`Failed to update profile: ${updateError.message}`, 400));
            }
        }

        // Update password if provided
        if (password && currentPassword) {
            const { error: passwordError } = await supabase.auth.updateUser({
                password: password
            });

            if (passwordError) {
                return next(new AppError(`Failed to update password: ${passwordError.message}`, 400));
            }
        }

        // Get updated user data
        const { data: userData, error: userError } = await supabase.auth.getUser(token);

        if (userError) {
            return next(new AppError('Failed to retrieve updated user data', 500));
        }

        // Extract user metadata
        const user = userData.user;
        const metadata = user.user_metadata || {};

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: metadata.name || (user.email ? user.email.split('@')[0] : 'User'),
                role: metadata.role || 'learner',
                emailVerified: user.email_confirmed_at ? true : false
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        next(error);
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Only admins can get all users
        if (req.user?.role !== 'admin') {
            return next(new AppError('Unauthorized: Only admins can view all users', 403));
        }

        // Get all users from Supabase
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            return next(new AppError(`Failed to get users: ${error.message}`, 400));
        }

        // Format the user data
        const users = data.users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
            role: user.user_metadata?.role || 'learner',
            emailVerified: user.email_confirmed_at ? true : false,
            createdAt: user.created_at
        }));

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        next(error);
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Only admins can update user roles
        if (req.user?.role !== 'admin') {
            return next(new AppError('Unauthorized: Only admins can update user roles', 403));
        }

        const { userId } = req.params;
        const { newRole } = req.body;

        if (!userId || !newRole) {
            return next(new AppError('User ID and new role are required', 400));
        }

        // Get the user from Supabase
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !userData.user) {
            return next(new AppError(`User not found: ${userError?.message || 'User does not exist'}`, 404));
        }

        // Update the user's role in metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...userData.user.user_metadata,
                role: newRole
            }
        });

        if (updateError) {
            return next(new AppError(`Failed to update user role: ${updateError.message}`, 400));
        }

        res.json({
            success: true,
            message: `User role updated to ${newRole} successfully`
        });
    } catch (error) {
        console.error('Update user role error:', error);
        next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Only admins can delete users
        if (req.user?.role !== 'admin') {
            return next(new AppError('Unauthorized: Only admins can delete users', 403));
        }

        const { userId } = req.params;

        if (!userId) {
            return next(new AppError('User ID is required', 400));
        }

        // Delete user from Supabase Auth
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            return next(new AppError(`Failed to delete user: ${error.message}`, 400));
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        next(error);
    }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new AppError('Email is required', 400));
        }

        // Request password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/reset-password'
        });

        if (error) {
            return next(new AppError(`Failed to send password reset email: ${error.message}`, 400));
        }

        res.json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        next(error);
    }
};

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            return next(new AppError('Reset token is required', 400));
        }

        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
        });

        if (error) {
            return next(new AppError('Invalid or expired reset token', 400));
        }

        res.json({
            success: true,
            message: 'Token is valid'
        });
    } catch (error) {
        console.error('Verify reset token error:', error);
        next(error);
    }
};
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { password } = req.body;

        if (!password) {
            return next(new AppError('New password is required', 400));
        }

        // Update the password
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            return next(new AppError(`Failed to reset password: ${error.message}`, 400));
        }

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        next(error);
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;

        // Get all courses count
        const { count: totalCoursesCount, error: coursesError } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true });

        if (coursesError) {
            return next(new AppError(`Failed to get courses count: ${coursesError.message}`, 500));
        }

        // Get user's enrolled courses
        const { data: enrolledCoursesData, error: enrolledError } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId);

        if (enrolledError) {
            return next(new AppError(`Failed to get enrolled courses: ${enrolledError.message}`, 500));
        }

        // Get completed lectures count
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', true);

        if (progressError) {
            return next(new AppError(`Failed to get progress data: ${progressError.message}`, 500));
        }

        res.json({
            success: true,
            stats: {
                totalCourses: totalCoursesCount || 0,
                enrolledCourses: enrolledCoursesData?.length || 0,
                completedLectures: progressData?.length || 0
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        next(error);
    }
};

export const getEnrolledCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sort = (req.query.sort as string) || 'newest';
        const search = (req.query.search as string) || '';

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Get user's enrolled courses with course details
        let query = supabase
            .from('bookings')
            .select(`
                id,
                course_id,
                created_at,
                courses:course_id(id, title, description, short_description, image_url, modules_count)
            `)
            .eq('user_id', userId);

        // Apply search if provided
        if (search) {
            query = query.textSearch('courses.title', search, {
                config: 'english'
            });
        }

        // Apply sorting
        switch (sort) {
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            case 'title_asc':
                query = query.order('courses.title', { ascending: true });
                break;
            case 'title_desc':
                query = query.order('courses.title', { ascending: false });
                break;
            case 'progress_asc':
                // This would require more complex logic with user progress
                query = query.order('created_at', { ascending: true });
                break;
            case 'progress_desc':
                // This would require more complex logic with user progress
                query = query.order('created_at', { ascending: false });
                break;
            case 'newest':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Execute the query
        const { data: enrolledCoursesData, error: enrolledError, count } = await query;

        if (enrolledError) {
            return next(new AppError(`Failed to get enrolled courses: ${enrolledError.message}`, 500));
        }

        // Get progress data for each course
        const courseIds = enrolledCoursesData?.map(booking => booking.course_id) || [];

        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .in('course_id', courseIds);

        if (progressError) {
            return next(new AppError(`Failed to get progress data: ${progressError.message}`, 500));
        }

        // Process the data to format it for the frontend
        const courses = enrolledCoursesData?.map(booking => {
            const course = booking.courses as any; // Type assertion to avoid TypeScript errors
            const courseProgress = progressData?.filter(p => p.course_id === booking.course_id) || [];
            const completedLectures = courseProgress.filter(p => p.completed).length;

            return {
                id: course.id,
                title: course.title,
                description: course.description,
                short_description: course.short_description,
                image_url: course.image_url,
                total_lectures: course.modules_count || 0,
                completed_lectures: completedLectures,
                enrollment_date: booking.created_at
            };
        });

        // Calculate total pages
        const totalPages = Math.ceil((count || 0) / limit);

        res.json({
            success: true,
            courses: courses || [],
            page,
            limit,
            totalPages,
            totalCourses: count || 0
        });
    } catch (error) {
        console.error('Get enrolled courses error:', error);
        next(error);
    }
};