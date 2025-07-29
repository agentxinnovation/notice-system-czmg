import axios from 'axios';

const API = axios.create({
  baseURL: 'https://0hnvvn91-5000.inc1.devtunnels.ms/api',
});

// Attach Authorization header if token exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public Routes
export const getNotices = () => API.get('/notices');
export const getNoticesAll = (params = {}) => API.get('/notices/all', { params });
export const getNoticeById = (id) => API.get(`/notices/${id}`);

// Protected Admin Routes
export const createNotice = (data) => API.post('/notices', data);         // POST /notices
export const updateNotice = (id, data) => API.put(`/notices/${id}`, data); // PUT /notices/:id
export const deleteNotice = (id) => API.delete(`/notices/${id}`);         // DELETE /notices/:id

// Auth Routes
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
