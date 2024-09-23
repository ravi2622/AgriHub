const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    mobilenumber: Joi.number().required(),
    role: Joi.string().valid('farmer', 'retailer').default('farmer'),
    location: Joi.string().required(),
    country: Joi.string().required(),
});

const validateCrop = Joi.object({
    cropdata: Joi.object({
        name: Joi.string().required(),
        croptype: Joi.string().required(),
        variety: Joi.string().optional(),
        plantedDate: Joi.date().iso().required(),
        harvestDate: Joi.date().iso().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().valid('kg', 'liters', 'units').required(),
        description: Joi.string().optional(),
        price: Joi.number().positive().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.string().optional() // Adjusted for image, if it's not required in form
    }).required()
});

const reviewSchema = Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
        createdAt: Joi.date(),
});

// Export both schemas together
module.exports = { signupSchema, validateCrop, reviewSchema };