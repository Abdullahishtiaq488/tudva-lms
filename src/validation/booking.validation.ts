import Joi from 'joi';

export const createBookingSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  selectedSlots: Joi.array().items(Joi.string().uuid()).optional() // Only for flexible courses
});