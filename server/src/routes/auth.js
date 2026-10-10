const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { z } = require('zod');
const User = require('../models/user.model');
const RefreshSession = require('../models/RefreshSession');
const { AppError, asyncHandler } = require('../middleware/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const refreshLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const refreshCookie = 'refreshToken';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(72),
  role: z.enum(['founder', 'investor']),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(72),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  };
}

function createAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
      issuer: 'ventureboard-api',
      audience: 'ventureboard-client',
    }
  );
}

function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function createRefreshSession(user, req, res) {
  const secret = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + refreshLifetimeMs);

  const session = await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(secret),
    expiresAt,
  });

  res.cookie(refreshCookie, `${session._id}.${secret}`, {
    ...cookieOptions(),
    expires: expiresAt,
  });
}

function readRefreshCookie(req) {
  const value = req.cookies?.[refreshCookie];
  if (!value) throw new AppError(401, 'Refresh token required.');

  const separator = value.indexOf('.');
  if (separator < 1) throw new AppError(401, 'Refresh token is invalid.');

  return {
    sessionId: value.slice(0, separator),
    secret: value.slice(separator + 1),
  };
}

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: req.body.password,
      role: req.body.role,
    });

    await createRefreshSession(user, req, res);
    res.status(201).json({
      user: publicUser(user),
      accessToken: createAccessToken(user),
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  })
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
    if (!user || !(await user.checkPassword(req.body.password))) {
      throw new AppError(401, 'Email or password is incorrect.');
    }

    await createRefreshSession(user, req, res);
    res.json({
      user: publicUser(user),
      accessToken: createAccessToken(user),
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  })
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { sessionId, secret } = readRefreshCookie(req);
    const oldHash = hashToken(secret);
    const nextSecret = crypto.randomBytes(48).toString('hex');
    const nextExpiry = new Date(Date.now() + refreshLifetimeMs);

    // Compare-and-swap: only one request can rotate this refresh token.
    const session = await RefreshSession.findOneAndUpdate(
      {
        _id: sessionId,
        tokenHash: oldHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { tokenHash: hashToken(nextSecret), expiresAt: nextExpiry } },
      { new: true }
    );

    if (!session) throw new AppError(401, 'Refresh token is invalid or expired.');

    const user = await User.findById(session.userId);
    if (!user) throw new AppError(401, 'User no longer exists.');

    res.cookie(refreshCookie, `${session._id}.${nextSecret}`, {
      ...cookieOptions(),
      expires: nextExpiry,
    });

    res.json({
      accessToken: createAccessToken(user),
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const value = req.cookies?.[refreshCookie];
    const match = typeof value === 'string'
      ? /^([a-f\d]{24})\.([a-f\d]{96})$/i.exec(value)
      : null;

    if (match) {
      await RefreshSession.updateOne(
        {
          _id: match[1],
          tokenHash: hashToken(match[2]),
          revokedAt: null,
        },
        { $set: { revokedAt: new Date() } }
      );
    }

    res.clearCookie(refreshCookie, cookieOptions());

    // Remove the cookie from our earlier auth implementation.
    res.clearCookie('token', { path: '/' });

    res.json({ message: 'Logged out.' });
  })
);

module.exports = router;