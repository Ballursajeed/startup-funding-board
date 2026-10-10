import axiosInstance from './client.js';

export function register(name, email, password, role) {
  return axiosInstance.post('/api/auth/register', { name, email, password, role });
}

export function login(email, password) {
  return axiosInstance.post('/api/auth/login', { email, password });
}

export function logout() {
  return axiosInstance.post('/api/auth/logout');
}

export function refreshToken() {
  // No body; withCredentials sends the cookie automatically
  return axiosInstance.post('/api/auth/refresh');
}

export function getMe(token) {
  // Called during app init with an explicit token because setToken may not
  // have propagated to the interceptor yet in the same tick.
  return axiosInstance.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
