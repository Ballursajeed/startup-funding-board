class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function asyncHandler(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

function errorHandler(err, req, res, next) {
  if (err.code === 11000) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({ error: 'Invalid input.', details: err.issues });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ error: message });
}

module.exports = { AppError, asyncHandler, errorHandler };