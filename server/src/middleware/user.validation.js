const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z.string()
    .min(8)
    .refine(
      (password) => Buffer.byteLength(password, 'utf8') <= 72,
      'Password must be at most 72 bytes.'
    ),
  role: z.enum(['founder', 'investor']),
}).strict();

const loginSchema = z.object({
  email: z.string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(256),
}).strict();

function validateRegister(req, res, next) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.body = result.data;
  next();
}

function validateLogin(req, res, next) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.body = result.data;
  next();
}

module.exports = { validateRegister, validateLogin };