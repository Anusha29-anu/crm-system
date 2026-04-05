import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getUsers: () => api.get('/auth/users'),
};

// Contacts API
export const contacts = {
  getAll: () => api.get('/contacts'),
  get: (id: number) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: number, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
};

// Deals API
export const deals = {
  getAll: () => api.get('/deals'),
  create: (data: any) => api.post('/deals', data),
  updateStage: (id: number, stage: string) => api.put(`/deals/${id}/stage`, { stage }),
  delete: (id: number) => api.delete(`/deals/${id}`),
};

// Activities API
export const activities = {
  getAll: () => api.get('/activities'),
  create: (data: any) => api.post('/activities', data),
  complete: (id: number) => api.put(`/activities/${id}/complete`),
  delete: (id: number) => api.delete(`/activities/${id}`),
};

// Emails API
export const emails = {
  getAll: () => api.get('/emails'),
  send: (data: any) => api.post('/emails', data),
};

// Notes API
export const notes = {
  get: (contactId: number) => api.get(`/notes/${contactId}`),
  create: (data: any) => api.post('/notes', data),
};

// Dashboard API
export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;