const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  next();
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  developer: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    is_active: Joi.boolean().default(true),
  }),

  compound: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    developer_id: Joi.number().integer().positive().required(),
    location: Joi.string().allow('', null),
    is_active: Joi.boolean().default(true),
  }),

  unit: Joi.object({
    unit_number: Joi.string().min(1).max(100).required(),
    developer_id: Joi.number().integer().positive().required(),
    compound_id: Joi.number().integer().positive().required(),
    unit_type: Joi.string().max(100).allow('', null),
    offering_type: Joi.string().max(100).allow('', null),
    land_area: Joi.number().positive().allow(null),
    bua: Joi.number().positive().allow(null),
    description: Joi.string().allow('', null),
    price: Joi.number().positive().allow(null),
    state: Joi.string().max(100).allow('', null),
    materials: Joi.string().allow('', null),
    material_link: Joi.string().uri().allow('', null),
    owner_name: Joi.string().max(255).allow('', null),
    owner_phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).allow('', null),
    owner_phones: Joi.array().items(Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).allow('', null)).optional(),
    owner_email: Joi.string().email().allow('', null),
    status: Joi.string().max(50).valid('available', 'sold', 'reserved', 'rented').default('available'),
  }),

  unitFilter: Joi.object({
    developer_id: Joi.number().integer().positive(),
    compound_id: Joi.number().integer().positive(),
    unit_type: Joi.string(),
    offering_type: Joi.string(),
    status: Joi.string(),
    min_price: Joi.number().positive(),
    max_price: Joi.number().positive(),
    min_bua: Joi.number().positive(),
    max_bua: Joi.number().positive(),
    search: Joi.string(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

module.exports = { validate, schemas };