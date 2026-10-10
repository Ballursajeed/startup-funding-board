const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  };
}

function generateAccessToken(userId) {
  return jwt.sign(
    { sub: userId.toString() },
    process.env.JWT_ACCESS_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '15m',
      issuer: 'ventureboard-api',
      audience: 'ventureboard-client',
    }
  );
}

function generateRefreshSecret() {
  return crypto.randomBytes(48).toString('hex');
}

function hashRefreshSecret(secret) {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function getRefreshExpiry() {
  return new Date(Date.now() + REFRESH_LIFETIME_MS);
}

function setRefreshCookie(res, sessionId, secret, expiresAt) {
  const refreshToken = `${sessionId}.${secret}`;

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    expires: expiresAt,
  });
}

function readRefreshToken(req) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (typeof refreshToken !== 'string') {
    return null;
  }

  const match = /^([a-f\d]{24})\.([a-f\d]{96})$/i.exec(refreshToken);

  if (!match) {
    return null;
  }

  return {
    sessionId: match[1],
    secret: match[2],
  };
}

function getPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    savedStartups: (user.savedStartups || []).map((id) => id.toString()),
  };
}

module.exports = {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
  generateAccessToken,
  generateRefreshSecret,
  hashRefreshSecret,
  getRefreshExpiry,
  setRefreshCookie,
  readRefreshToken,
  getPublicUser,
};