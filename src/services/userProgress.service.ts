// src/services/userProgress.service.ts
import { AppDataSource } from "../config/database";
import { UserProgress } from "../models/UserProgress.model";
import { User } from "../models/User.model";
import { Course } from "../models/Course.model";
import { Module } from "../models/Module.model";
import { AppError } from "../middleware/errorHandler.middleware";
import { supabase } from "../utils/supabaseClient";

const userProgressRepository = AppDataSource.getRepository(UserProgress);
const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);
const moduleRepository = AppDataSource.getRepository(Module);

/**
 * Track user progress for a specific module in a course
 */
export const trackProgress = async (
    userId: string,
    courseId: string,
    moduleId: string,
    completed: boolean,
    progressPercentage: number
) => {
    // Validate inputs
    if (!userId || !courseId || !moduleId) {
        throw new AppError("User ID, course ID, and module ID are required", 400);
    }

    // Check if user exists
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Check if course exists
    const course = await courseRepository.findOneBy({ id: courseId });
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    // Check if module exists
    const module = await moduleRepository.findOneBy({ id: moduleId });
    if (!module) {
        throw new AppError("Module not found", 404);
    }

    // Check if progress record already exists
    let progress = await userProgressRepository.findOne({
        where: {
            user_id: userId,
            course_id: courseId,
            module_id: moduleId
        }
    });

    if (progress) {
        // Update existing progress
        progress.completed = completed;
        progress.progress_percentage = progressPercentage;
        progress.last_accessed = new Date();
    } else {
        // Create new progress record
        progress = userProgressRepository.create({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            completed,
            progress_percentage: progressPercentage,
            last_accessed: new Date()
        });
    }

    // Save progress
    await userProgressRepository.save(progress);

    // Update Supabase user_progress table for real-time access
    const { error } = await supabase
        .from('user_progress')
        .upsert({
            id: progress.id,
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            completed,
            progress_percentage: progressPercentage,
            last_accessed: new Date().toISOString()
        });

    if (error) {
        console.error("Error updating Supabase user_progress:", error);
        // Continue execution even if Supabase update fails
    }

    return progress;
};

/**
 * Get user progress for a specific course
 */
export const getCourseProgress = async (userId: string, courseId: string) => {
    // Validate inputs
    if (!userId || !courseId) {
        throw new AppError("User ID and course ID are required", 400);
    }

    // Get all modules for the course
    const modules = await moduleRepository.find({
        where: { course: { id: courseId } }
    });

    if (!modules || modules.length === 0) {
        return {
            totalModules: 0,
            completedModules: 0,
            overallProgress: 0,
            moduleProgress: []
        };
    }

    // Get progress for all modules in the course
    const progress = await userProgressRepository.find({
        where: {
            user_id: userId,
            course_id: courseId
        }
    });

    // Calculate overall progress
    const completedModules = progress.filter(p => p.completed).length;
    const overallProgress = modules.length > 0 
        ? Math.round((completedModules / modules.length) * 100) 
        : 0;

    // Map module progress
    const moduleProgress = modules.map(module => {
        const moduleProgress = progress.find(p => p.module_id === module.id);
        return {
            moduleId: module.id,
            title: module.title,
            completed: moduleProgress ? moduleProgress.completed : false,
            progressPercentage: moduleProgress ? moduleProgress.progress_percentage : 0,
            lastAccessed: moduleProgress ? moduleProgress.last_accessed : null
        };
    });

    return {
        totalModules: modules.length,
        completedModules,
        overallProgress,
        moduleProgress
    };
};

/**
 * Get all user progress across all courses
 */
export const getAllUserProgress = async (userId: string) => {
    // Validate inputs
    if (!userId) {
        throw new AppError("User ID is required", 400);
    }

    // Get all courses the user is enrolled in
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('course_id')
        .eq('user_id', userId);

    if (bookingsError) {
        throw new AppError(`Failed to get user bookings: ${bookingsError.message}`, 500);
    }

    if (!bookings || bookings.length === 0) {
        return {
            enrolledCourses: 0,
            totalProgress: 0,
            courseProgress: []
        };
    }

    const courseIds = bookings.map(booking => booking.course_id);

    // Get all courses
    const courses = await courseRepository.findBy({ id: { $in: courseIds } as any });

    // Get progress for all courses
    const progressPromises = courseIds.map(courseId => getCourseProgress(userId, courseId));
    const courseProgressResults = await Promise.all(progressPromises);

    // Calculate overall progress across all courses
    const totalProgress = courseProgressResults.length > 0
        ? Math.round(courseProgressResults.reduce((sum, progress) => sum + progress.overallProgress, 0) / courseProgressResults.length)
        : 0;

    // Map course progress with course details
    const courseProgress = courseProgressResults.map((progress, index) => {
        const courseId = courseIds[index];
        const course = courses.find(c => c.id === courseId);
        
        return {
            courseId,
            title: course ? course.title : 'Unknown Course',
            totalModules: progress.totalModules,
            completedModules: progress.completedModules,
            overallProgress: progress.overallProgress,
            moduleProgress: progress.moduleProgress
        };
    });

    return {
        enrolledCourses: courseIds.length,
        totalProgress,
        courseProgress
    };
};
