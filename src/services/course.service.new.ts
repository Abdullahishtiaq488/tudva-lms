import { Course } from "../models/Course.model";
import { Module } from "../models/Module.model";
import { Slot } from "../models/Slot.model";
import { SeminarDay } from "../models/SeminarDay.model";
import { Lecture } from "../models/Lecture.model";
import { AppDataSource } from "../config/database";
import { FindManyOptions, In, Like } from "typeorm";
import { AppError } from "../middleware/errorHandler.middleware";
import { User, UserRole } from "../models/User.model";
import { logActivity } from "./activityLog.service";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { uploadFile, getSignedUrl } from '../utils/supabaseStorage';
import { FAQ } from "../models/FAQ.model";
import { Tag } from "../models/Tag.model";

// Initialize repositories
const courseRepository = AppDataSource.getRepository(Course);
const moduleRepository = AppDataSource.getRepository(Module);
const slotRepository = AppDataSource.getRepository(Slot);
const seminarDayRepository = AppDataSource.getRepository(SeminarDay);
const userRepository = AppDataSource.getRepository(User);
const lectureRepository = AppDataSource.getRepository(Lecture);
const faqRepository = AppDataSource.getRepository(FAQ);
const tagRepository = AppDataSource.getRepository(Tag);

// Supabase storage bucket name
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'tudva-bucker';

// --- Type Definitions ---
interface NewModuleData {
  title: string;
  description?: string;
  slotId?: string | null;
  moduleNumber: number;
}

interface ExistingModuleData extends NewModuleData {
  id: string;
}

interface ModuleData {
  id?: string;
  title: string;
  description?: string;
  slotId?: string | null;
  moduleNumber: number;
}

interface FAQData {
  question: string;
  answer: string;
  sortOrder?: number;
}

interface TagData {
  tagName: string;
}

interface UpdateCourseData {
  title?: string;
  short_description?: string;
  description?: string;
  category?: string;
  level?: string;
  language?: string;
  format?: string;
  modules_count?: number;
  status?: string;
  lectures?: any[]; // Simplified for now
  faqs?: FAQData[];
  tags?: TagData[];
}

/**
 * Upload a video file to Supabase Storage
 * @param file The video file buffer
 * @param originalname Original filename
 * @returns URL of the uploaded file
 */
export async function uploadVideoToGCS(file: Buffer, originalname: string): Promise<string> {
  try {
    const fileExtension = path.extname(originalname);
    const contentType = getContentType(fileExtension);
    const filename = `course-videos/${uuidv4()}${fileExtension}`;
    
    // Use the Supabase storage utility to upload the file
    const fileUrl = await uploadFile(file, 'course-videos', contentType, bucketName);
    
    return fileUrl;
  } catch (error: any) {
    throw new AppError(`Video upload error: ${error.message}`, 500);
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
  };
  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Create a new course
 */
export const createCourse = async (
  title: string,
  shortDesription: string,
  category: string,
  level: string,
  language: string,
  format: string,
  modulesCount: number,
  description: string,
  faqs: FAQData[] | undefined,
  tags: TagData[] | undefined,
  req: any
) => {
  if (!title || !shortDesription || !format || !category || !level || !language || !modulesCount || !description) {
    throw new AppError("Missing required course details or modules.", 400);
  }

  const instructorId = req.user.userId;

  const instructor = await userRepository.findOneBy({ id: instructorId });
  if (!instructor) {
    throw new AppError("Instructor not found.", 404);
  }

  if (instructor.role !== UserRole.Instructor && instructor.role !== UserRole.Admin) {
    throw new AppError("Unauthorized: Only instructors and admins can create courses.", 403);
  }

  const newCourse = courseRepository.create({
    title: title,
    short_description: shortDesription,
    description: description,
    category: category,
    level: level,
    language: language,
    format: format,
    modules_count: modulesCount,
    instructor_id: instructorId,
    status: "pending", // Default status
  });

  const savedCourse = await courseRepository.save(newCourse);

  if (faqs && faqs.length > 0) {
    const faqEntities = faqs.map((faq) => {
      const faqEntity = faqRepository.create({
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder ?? 0,
        course: savedCourse,
        course_id: savedCourse.id,
      });
      return faqEntity;
    });
    await faqRepository.save(faqEntities);
  }
  
  // Save Tags
  if (tags && tags.length > 0) {
    const tagEntities = tags.map((tag) => {
      const tagEntity = tagRepository.create({
        tag_name: tag.tagName,
        course: savedCourse,
        course_id: savedCourse.id,
      });
      return tagEntity;
    });
    await tagRepository.save(tagEntities);
  }

  await logActivity("create", "Course", savedCourse.id, instructorId, { title: savedCourse.title });

  return {
    success: true,
    message: "Course created successfully.",
    course: savedCourse,
  };
};

/**
 * Update an existing course
 */
export const updateCourse = async (
  courseId: string,
  updateData: UpdateCourseData,
  req: any
) => {
  const instructorId = req.user.userId;

  const instructor = await userRepository.findOneBy({ id: instructorId });
  if (!instructor) {
    throw new AppError("Instructor not found.", 404);
  }

  if (instructor.role !== UserRole.Instructor && instructor.role !== UserRole.Admin) {
    throw new AppError("Unauthorized: Only instructors/admins can update.", 403);
  }

  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: ["lectures", "faqs", "tags"],
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check if the instructor is the owner of the course or an admin
  if (course.instructor_id !== instructorId && instructor.role !== UserRole.Admin) {
    throw new AppError("Unauthorized: You can only update your own courses.", 403);
  }

  // Update basic course fields
  if (updateData.title) course.title = updateData.title;
  if (updateData.short_description) course.short_description = updateData.short_description;
  if (updateData.description) course.description = updateData.description;
  if (updateData.category) course.category = updateData.category;
  if (updateData.level) course.level = updateData.level;
  if (updateData.language) course.language = updateData.language;
  if (updateData.format) course.format = updateData.format;
  if (updateData.modules_count) course.modules_count = updateData.modules_count;
  if (updateData.status) course.status = updateData.status;

  // Save the updated course
  const updatedCourse = await courseRepository.save(course);

  // Log the activity
  await logActivity("update", "Course", updatedCourse.id, instructorId, { title: updatedCourse.title });

  return {
    success: true,
    message: "Course updated successfully.",
    course: updatedCourse,
  };
};

/**
 * Get a course by ID
 */
export const getCourseById = async (courseId: string) => {
  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: ['lectures', 'faqs', 'tags', 'instructor'],
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Group lectures by module
  const modules: any[] = [];
  if (course.lectures && course.lectures.length > 0) {
    // Group by moduleName
    const moduleGroups = course.lectures.reduce((groups: any, lecture) => {
      const moduleName = lecture.moduleName || 'Default Module';
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push(lecture);
      return groups;
    }, {});

    // Convert to array format
    Object.keys(moduleGroups).forEach((moduleName, index) => {
      modules.push({
        id: `module-${index}`,
        title: moduleName,
        lectures: moduleGroups[moduleName].sort((a: any, b: any) => a.sortOrder - b.sortOrder),
      });
    });
  }

  return {
    success: true,
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      modules_count: course.modules_count,
      short_description: course.short_description,
      category: course.category,
      format: course.format,
      instructor: course.instructor,
      tags: course.tags,
      faqs: course.faqs,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    },
    modules,
  };
};

/**
 * Get all courses with pagination and filtering
 */
export const getCourses = async (
  page: number = 1,
  pageSize: number = 10,
  subject?: string,
  format?: string,
  seminarDayId?: string,
  search?: string
) => {
  // Build the query
  const query = courseRepository.createQueryBuilder("course")
    .leftJoinAndSelect("course.lectures", "lectures")
    .leftJoinAndSelect("course.faqs", "faqs")
    .leftJoinAndSelect("course.tags", "tags");

  // Apply filters
  if (subject) {
    query.andWhere("course.category = :subject", { subject });
  }
  if (format) {
    query.andWhere("course.format = :format", { format });
  }
  if (seminarDayId) {
    query.andWhere("course.seminarDayId = :seminarDayId", { seminarDayId });
  }
  if (search) {
    query.andWhere(
      "(course.title LIKE :search OR course.short_description LIKE :search OR course.description LIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Pagination
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Execute query to get courses and total count
  const [courses, total] = await query
    .skip(skip)
    .take(take)
    .orderBy("course.createdAt", "DESC")
    .getManyAndCount();

  return {
    success: true,
    courses,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

/**
 * Get modules for a course
 */
export const getModulesForCourse = async (courseId: string) => {
  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: ["lectures"],
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Group lectures by module
  const modules: any[] = [];
  if (course.lectures && course.lectures.length > 0) {
    // Group by moduleName
    const moduleGroups = course.lectures.reduce((groups: any, lecture) => {
      const moduleName = lecture.moduleName || 'Default Module';
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push(lecture);
      return groups;
    }, {});

    // Convert to array format
    Object.keys(moduleGroups).forEach((moduleName, index) => {
      modules.push({
        id: `module-${index}`,
        title: moduleName,
        lectures: moduleGroups[moduleName].sort((a: any, b: any) => a.sortOrder - b.sortOrder),
      });
    });
  }

  return {
    success: true,
    modules,
  };
};

/**
 * Get all courses for admin
 */
export const getAllCoursesAdmin = async (
  page: number = 1,
  pageSize: number = 10,
  filters: any = {}
) => {
  // Build the query
  const query = courseRepository.createQueryBuilder("course")
    .leftJoinAndSelect("course.instructor", "instructor")
    .leftJoinAndSelect("course.lectures", "lectures")
    .leftJoinAndSelect("course.faqs", "faqs")
    .leftJoinAndSelect("course.tags", "tags");

  // Apply filters
  if (filters.subject) {
    query.andWhere("course.category = :subject", { subject: filters.subject });
  }
  if (filters.format) {
    query.andWhere("course.format = :format", { format: filters.format });
  }
  if (filters.instructorId) {
    query.andWhere("course.instructor_id = :instructorId", { instructorId: filters.instructorId });
  }

  // Pagination
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Execute query to get courses and total count
  const [courses, total] = await query
    .skip(skip)
    .take(take)
    .orderBy("course.createdAt", "DESC")
    .getManyAndCount();

  return {
    success: true,
    courses,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

/**
 * Delete a course
 */
export const deleteCourse = async (adminId: string, courseId: string) => {
  const admin = await userRepository.findOneBy({ id: adminId });
  if (!admin || admin.role !== UserRole.Admin) {
    throw new AppError("Unauthorized: Only admins can delete courses.", 403);
  }

  const course = await courseRepository.findOneBy({ id: courseId });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  await courseRepository.remove(course);

  await logActivity("delete", "Course", courseId, adminId, { title: course.title });

  return {
    success: true,
    message: "Course deleted successfully.",
  };
};
