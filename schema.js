const Joi = require('joi');

const singupSchemaValidation = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    mobilenumber: Joi.number().required(),
    role: Joi.string().valid('farmer', 'retailer').default('farmer'),
    location: Joi.string().required(),
    country: Joi.string().required(),
    profilepicture: Joi.object({
        url: Joi.string().required(),
    }).required(),
});

module.exports = { singupSchemaValidation };
