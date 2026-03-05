const Joi = require('joi');

const cacheSchema = Joi.object({
    key: Joi.string().required(),
    value: Joi.any().required(),
    ttl: Joi.number().integer().min(1).optional()
});

const validateCachePayload = (req, res, next) => {
    const { error } = cacheSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.details.map((detail) => detail.message)
        });
    }
    next();
};

module.exports = validateCachePayload;
