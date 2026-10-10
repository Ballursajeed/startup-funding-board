const User = require('../models/user.model');
const RefreshSession = require('../models/RefreshSession');
const { AppError } = require('../middleware/errors');

const {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
  generateAccessToken,
  generateRefreshSecret,
  hashRefreshSecret,
  getRefreshExpiry,
  setRefreshCookie,
  readRefreshToken,
  getPublicUser,
} = require('../utils/authTokens');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(409, 'An account with that email already exists.');
    }

    // The User model hashes passwordHash in its pre-save hook.
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshSecret = generateRefreshSecret();
    const expiresAt = getRefreshExpiry();

    const session = await RefreshSession.create({
      userId: user._id,
      tokenHash: hashRefreshSecret(refreshSecret),
      expiresAt,
    });

    setRefreshCookie(res, session._id, refreshSecret, expiresAt);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: getPublicUser(user),
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    });
 } catch (error) {
  console.error('Registration failed:', {
    code: error.code,
    message: error.message,
    keyPattern: error.keyPattern,
  });

  next(error);
}
}

async function userLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      throw new AppError(401, 'Email or password is incorrect.');
    }

    const isPasswordCorrect = await user.checkPassword(password);

    if (!isPasswordCorrect) {
      throw new AppError(401, 'Email or password is incorrect.');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshSecret = generateRefreshSecret();
    const expiresAt = getRefreshExpiry();

    const session = await RefreshSession.create({
      userId: user._id,
      tokenHash: hashRefreshSecret(refreshSecret),
      expiresAt,
    });

    setRefreshCookie(res, session._id, refreshSecret, expiresAt);

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      user: getPublicUser(user),
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  } catch (error) {
    next(error);
  }
}

async function checkAuth(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: 'User is authenticated.',
      user: getPublicUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

async function refreshAccessToken(req, res, next) {
  try {
    const refreshToken = readRefreshToken(req);

    if (!refreshToken) {
      throw new AppError(401, 'Refresh token is missing or invalid.');
    }

    const currentSession = await RefreshSession.findOne({
      _id: refreshToken.sessionId,
      tokenHash: hashRefreshSecret(refreshToken.secret),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!currentSession) {
      throw new AppError(401, 'Refresh token is invalid or expired.');
    }

    const user = await User.findById(currentSession.userId);

    if (!user) {
      throw new AppError(401, 'User no longer exists.');
    }

    const accessToken = generateAccessToken(user._id);
    const nextSecret = generateRefreshSecret();
    const nextExpiry = getRefreshExpiry();

    // The hash condition prevents the same refresh token being rotated twice.
    const updatedSession = await RefreshSession.findOneAndUpdate(
      {
        _id: currentSession._id,
        tokenHash: currentSession.tokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          tokenHash: hashRefreshSecret(nextSecret),
          expiresAt: nextExpiry,
        },
      },
      { new: true }
    );

    if (!updatedSession) {
      throw new AppError(401, 'Refresh token has already been used or revoked.');
    }

    setRefreshCookie(res, updatedSession._id, nextSecret, nextExpiry);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed.',
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  } catch (error) {
    next(error);
  }
}

async function userLogout(req, res, next) {
  try {
    const refreshToken = readRefreshToken(req);

    if (refreshToken) {
      await RefreshSession.updateOne(
        {
          _id: refreshToken.sessionId,
          tokenHash: hashRefreshSecret(refreshToken.secret),
          revokedAt: null,
        },
        {
          $set: { revokedAt: new Date() },
        }
      );
    }

    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  userLogin,
  userLogout,
  checkAuth,
  refreshAccessToken,
};