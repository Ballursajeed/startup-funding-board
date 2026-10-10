import axiosInstance from './client.js';

const ALLOWED = ['name', 'tagline', 'description', 'industry', 'stage', 'fundingGoal', 'location', 'website', 'status'];

export function getStartups(params) {
  const query = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== null && value !== undefined) {
        query[key] = value;
      }
    }
  }
  return axiosInstance.get('/api/startups', { params: query });
}

export function getStartup(id) {
  return axiosInstance.get(`/api/startups/${id}`);
}

export function createStartup(data) {
  const body = {};
  for (const key of ALLOWED) {
    if (data[key] !== undefined && data[key] !== '') {
      body[key] = data[key];
    }
  }
  if (body.fundingGoal !== undefined) body.fundingGoal = Number(body.fundingGoal);
  return axiosInstance.post('/api/startups', body);
}

export function updateStartup(id, data) {
  const body = {};
  for (const key of ALLOWED) {
    if (data[key] !== undefined && data[key] !== '') {
      body[key] = data[key];
    }
  }
  if (body.fundingGoal !== undefined) body.fundingGoal = Number(body.fundingGoal);
  return axiosInstance.patch(`/api/startups/${id}`, body);
}

export function deleteStartup(id) {
  return axiosInstance.delete(`/api/startups/${id}`);
}
