import Joi from 'joi';

export const createCourseSchema = Joi.object({
    courseDetails: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        subject: Joi.string().required(),
        targetAudience: Joi.string().required(),
        format: Joi.string().valid('live', 'recorded').required(),
    }).required(),
    modules: Joi.array().items(
        Joi.object({
            title: Joi.string().required(),
            description: Joi.string().optional(),
            slotId: Joi.string().uuid().optional(), // Optional for flexible, required for live
            moduleNumber: Joi.number().integer().min(1).required()
        })
    ).required(),
    seminarDayId: Joi.string().uuid().required(),
    instructorId: Joi.string().uuid().optional() // Should not come from the request body!
});
