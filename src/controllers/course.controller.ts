import { Request, Response, NextFunction } from "express";
import * as courseService from "../services/course.service";
import { AuthRequest } from "../middleware/auth.middleware";
import multer from "multer"; // Import multer with type definitions
import { uploadVideoToGCS } from "../services/course.service"; // Import the upload function
const storage = multer.memoryStorage();


// Configure multer for file uploads
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow specific video mime types
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, shortDesription, category, level, language, modulesCount, description, faqs, tags } = req.body;

    const format = "recorded"; // You can make this dynamic if needed

    const result = await courseService.createCourse(
      title,
      shortDesription,
      category,
      level,
      language,
      format,
      modulesCount,
      description,
      faqs,
      tags,
      req
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || "1");
    const pageSize = parseInt(req.query.pageSize as string || "10");
    const subject = req.query.subject as string | undefined;
    const format = req.query.format as string | undefined;
    const seminarDayId = req.query.seminarDayId as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await courseService.getCourses(page, pageSize, subject, format, seminarDayId, search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { courseId } = req.params;
//     const result = await courseService.getCourseById(courseId);
//     res.status(200).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Request received for courseId:', req.params.courseId); // Debug log
    const { courseId } = req.params;
    const result = await courseService.getCourseById(courseId);
    console.log('Response from service:', result); // Debug log
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getCourseById:', error); // Debug log
    next(error);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  upload.any()(req, res, async (err) => {
    if (err) {
      console.error('Multer Upload Error:', err);
      return next(err);
    }

    try {
      const { courseId } = req.params;

      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      console.log('Content-Type:', req.headers['content-type']);

      // Determine if the request is JSON or multipart/form-data
      const isJsonRequest = req.headers['content-type']?.includes('application/json');
      // Define a type for course update data
      type UpdateCourseData = {
        title?: string;
        description?: string;
        short_description?: string;
        category?: string;
        level?: string;
        language?: string;
        format?: string;
        lectures?: any[];
        faqs?: any[];
        tags?: any[];
        [key: string]: any;
      };

      let updateData: UpdateCourseData = {};

      if (isJsonRequest) {
        // For application/json, use req.body directly
        updateData = {
          ...req.body, // Spread all fields like title, faqs, tags, etc.
          lectures: req.body.lectures || [], // Already an array, no parsing needed
          faqs: req.body.faqs || [],
          tags: req.body.tags || [],
        };
      } else {
        // For multipart/form-data, parse lectures and handle files
        const lecturesMetadata = req.body.lectures ? JSON.parse(req.body.lectures) : [];
        const files = (req.files as Express.Multer.File[]) || [];

        updateData = {
          ...req.body, // Other fields like title, description, etc.
          lectures: await Promise.all(
            lecturesMetadata.map(async (lecture: any, index: number) => {
              const file = files.find(f => f.fieldname === `videoFiles[0][${index}]`);
              let videoFileUrl;

              if (file) {
                console.log(`Processing file for lecture ${index}:`, {
                  fieldname: file.fieldname,
                  originalname: file.originalname,
                  mimetype: file.mimetype,
                  bufferLength: file.buffer.length,
                });
                videoFileUrl = await courseService.uploadVideoToGCS(file.buffer, file.originalname);
                console.log(`Successfully uploaded file. URL: ${videoFileUrl}`);
              }

              return {
                moduleName: lecture.moduleName, // Add moduleName here
                topicName: lecture.topicName,
                description: lecture.description,
                sortOrder: lecture.sortOrder,
                videoFile: videoFileUrl,
              };
            })
          ),
          faqs: req.body.faqs ? JSON.parse(req.body.faqs) : [],
          tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        };
      }

      console.log("Final updateData:", JSON.stringify(updateData, null, 2));

      const result = await courseService.updateCourse(courseId, updateData, req);
      res.status(200).json(result);
    } catch (error) {
      console.error('Update Course Error:', error);
      next(error);
    }
  });
};


export const getModulesForCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    // const result = await courseService.getModulesForCourse(courseId);
    // res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllCoursesAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || "1");
    const pageSize = parseInt(req.query.pageSize as string || "10");
    const filters = {
      subject: req.query.subject as string | undefined,
      format: req.query.format as string | undefined,
      seminarDayId: req.query.seminarDayId as string | undefined,
      instructorId: req.query.instructorId as string | undefined,
    };

    // const result = await courseService.getAllCoursesAdmin(page, pageSize, filters);
    // if (!result.success) {
    //   return next(new Error(result.error));
    // }
    // res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { courseId } = req.params;

    // const result = await courseService.deleteCourse(adminId, courseId);
    // res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};