const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('jobseeker', 'employer').default('jobseeker'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const companySchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().optional().allow(''),
  industry: Joi.string().max(100).optional().allow(''),
  location: Joi.string().max(150).optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  logo_url: Joi.string().optional().allow(''),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional().allow(''),
});

const jobSchema = Joi.object({
  company_id: Joi.string().required(),
  category_id: Joi.string().optional().allow('', null),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().required(),
  requirements: Joi.string().optional().allow(''),
  salary_min: Joi.number().integer().min(0).optional().allow(null),
  salary_max: Joi.number().integer().min(0).optional().allow(null),
  location: Joi.string().max(150).optional().allow(''),
  job_type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'remote').default('full-time'),
  is_active: Joi.boolean().default(true),
});

const applicationSchema = Joi.object({
  job_id: Joi.string().required(),
  cover_letter: Joi.string().optional().allow(''),
});

const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted').required(),
});

const jobQuerySchema = Joi.object({
  title: Joi.string().optional().allow(''),
  'company-name': Joi.string().optional().allow(''),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  companySchema,
  categorySchema,
  jobSchema,
  applicationSchema,
  applicationStatusSchema,
  jobQuerySchema,
};
