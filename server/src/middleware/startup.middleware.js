const { z } = require('zod');
const { AppError } = require('./errors');

const stageSchema = z.enum(['idea', 'pre-seed', 'seed', 'series-a']);
const statusSchema = z.enum(['fundraising', 'paused', 'funded']);

const websiteSchema = z.string()
  .trim()
  .max(300)
  .refine((value) => {
    if (value === '') return true;

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Website must be a valid HTTP or HTTPS URL.');

const startupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  tagline: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(3000),
  industry: z.string().trim().min(2).max(60),
  stage: stageSchema,
  fundingGoal: z.number().min(1).max(1000000000000),
  location: z.string().trim().max(100).optional(),
  website: websiteSchema.optional(),
  status: statusSchema.optional(),
}).strict();

const updateSchema = startupSchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  'Provide at least one field to update.'
);

const listQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  industry: z.string().trim().min(2).max(60).optional(),
  stage: stageSchema.optional(),
  status: statusSchema.optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
}).strict();

function requireFounder(req, res, next) {
  if (req.user.role !== 'founder') {
    return next(new AppError(403, 'Only founders can manage startup profiles.'));
  }

  next();
}

function validateStartupId(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return next(new AppError(400, 'Invalid startup ID.'));
  }

  next();
}

function validateCreateStartup(req, res, next) {
  const result = startupSchema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.body = result.data;
  next();
}

function validateUpdateStartup(req, res, next) {
  const result = updateSchema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.body = result.data;
  next();
}

function validateStartupQuery(req, res, next) {
  const result = listQuerySchema.safeParse(req.query);

  if (!result.success) {
    return next(result.error);
  }

  req.validatedQuery = result.data;
  next();
}

module.exports = {
  requireFounder,
  validateStartupId,
  validateCreateStartup,
  validateUpdateStartup,
  validateStartupQuery,
};