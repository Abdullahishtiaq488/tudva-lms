// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';
import { AppError } from './errorHandler.middleware'; // Import AppError

// Helper function to sanitize string inputs
const sanitizeString = (value: any) => {
    if (typeof value === 'string') {
        return sanitizeHtml(value, {
            allowedTags: [], // Remove all HTML tags
            allowedAttributes: {}, // Remove all attributes
        });
    }
    return value;
};

// Helper function to sanitize all string inputs in an object.
const sanitizeObject = (obj: any) : any => {

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if(Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitizedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if(typeof value === 'string'){
        sanitizedObj[key] = sanitizeString(value);
      }
      else if (typeof value === 'object'){
        sanitizedObj[key] = sanitizeObject(value); //Recursive call
      }
      else{
        sanitizedObj[key] = value;
      }
    }
  }
  return sanitizedObj;
}

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Sanitize the request body
        req.body = sanitizeObject(req.body);

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            // Use next(new AppError(...)) to pass to the error handler
            return next(new AppError(errorMessages.join(', '), 400));
        }

        next(); // No validation errors
    };
};