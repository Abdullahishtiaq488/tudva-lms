import Joi from 'joi';
import { UserRole } from '../models/User.model';

export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(), // Minimum 8 characters
    fullName: Joi.string().required(),
    role: Joi.string().valid(...Object.values(UserRole)).optional(), // Optional, with allowed values
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const updateUserProfileSchema = Joi.object({
    fullName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional(), // Validate if provided
    currentPassword: Joi.string().optional(), // Validate if provided
    notificationPreferences: Joi.object().optional(), // Add validation for preferences if needed
    profilePicture: Joi.string().optional(), // Allow base64 strings
    location: Joi.string().optional(),
    phoneNo: Joi.string().optional(),
    aboutMe: Joi.string().optional(),
    education: Joi.array().optional()
    // Add other fields as necessary
}).min(1); // Requires at least one field to be updated

export const updateUserRoleSchema = Joi.object({
    newRole: Joi.string().valid(...Object.values(UserRole)).required()
});