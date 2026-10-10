import axiosInstance from './client.js';

export function getSavedStartups() {
  return axiosInstance.get('/api/saved-startups');
}

export function saveStartup(id) {
  return axiosInstance.put(`/api/saved-startups/${id}`);
}

export function unsaveStartup(id) {
  return axiosInstance.delete(`/api/saved-startups/${id}`);
}
