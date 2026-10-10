const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { AppError } = require('./errors');

async function requireAuth(req, res, next) {
  try {
    const authorization = req.get('authorization') || '';
    const match = /^Bearer\s+(\S+)$/i.exec(authorization);

    if (!match) {
      throw new AppError(401, 'Access token required.');
    }

    let payload;

    try {
      payload = jwt.verify(match[1], process.env.JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
        issuer: 'ventureboard-api',
        audience: 'ventureboard-client',
      });
    } catch {
      throw new AppError(401, 'Access token is invalid or expired.');
    }

    if (
      typeof payload !== 'object' ||
      typeof payload.sub !== 'string' ||
      !/^[a-f\d]{24}$/i.test(payload.sub)
    ) {
      throw new AppError(401, 'Access token is invalid.');
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError(401, 'User no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireAuth };