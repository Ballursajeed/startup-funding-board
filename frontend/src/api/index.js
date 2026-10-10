export * from './client.js';
export * from './auth.api.js';

// Error normalisation helper
export function extractError(err) {
  if (!err) return 'An unexpected error occurred.';
  const data = err.response?.data;
  if (data) {
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data.error === 'string' && data.error) return data.error;
  }
  if (err.message) return err.message;
  return 'An unexpected error occurred.';
}

export * from './startups.api.js';
