import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let _token = null;
let _refreshPromise = null;
let _authFailureHandler = null;
let _refreshHandler = null;

export function setToken(t) {
  _token = t;
}

export function getToken() {
  return _token;
}

export function setAuthFailureHandler(fn) {
  _authFailureHandler = fn;
}

export function setRefreshHandler(fn) {
  _refreshHandler = fn;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (_token) {
    config.headers['Authorization'] = `Bearer ${_token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    // Do not retry refresh or login calls, and do not retry already-retried requests
    const isRefreshOrLogin =
      config?.url?.includes('/api/auth/refresh') ||
      config?.url?.includes('/api/auth/login');

    if (status === 401 && !config?._retry && !isRefreshOrLogin) {
      if (!_refreshHandler) {
        // No refresh handler registered yet — just fail
        _authFailureHandler?.();
        return Promise.reject(error);
      }

      // Queue concurrent 401s behind a single refresh call
      if (!_refreshPromise) {
        _refreshPromise = _refreshHandler()
          .catch((err) => {
            _refreshPromise = null;
            throw err;
          })
          .then((res) => {
            _refreshPromise = null;
            return res;
          });
      }

      try {
        const res = await _refreshPromise;
        const newToken = res.data.accessToken;
        setToken(newToken);

        // Retry the original request exactly once
        config._retry = true;
        config.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(config);
      } catch (refreshError) {
        setToken(null);
        _authFailureHandler?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
