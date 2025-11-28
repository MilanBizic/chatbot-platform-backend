import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', null, { params: data }),
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  getMe: () => api.get('/auth/me'),
};

export const chatbotAPI = {
  getAll: () => api.get('/chatbots'),
  getOne: (id) => api.get(`/chatbots/${id}`),
  create: (data) => api.post('/chatbots', null, { params: data }),
  update: (id, data) => api.put(`/chatbots/${id}`, null, { params: data }),
  delete: (id) => api.delete(`/chatbots/${id}`),
  getKeywords: (id) => api.get(`/chatbots/${id}/keywords`),
  addKeyword: (id, data) => api.post(`/chatbots/${id}/keywords`, null, { params: data }),
  deleteKeyword: (keywordId) => api.delete(`/keywords/${keywordId}`),
  getMessages: (id, limit = 50) => api.get(`/chatbots/${id}/messages`, { params: { limit } }),
  getAnalytics: (id) => api.get(`/chatbots/${id}/analytics`),
};

export default api;
