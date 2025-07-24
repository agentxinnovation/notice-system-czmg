import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getNotices = () => API.get('/notices');
export const getNoticesAll = (params = {}) => API.get('/notices/all', { params });
export const getNoticeById = (id) => API.get(`/notices/${id}`);
export const createNotice = (data) => API.post('/notices', data);
export const updateNotice = (id, data) => API.put(`/notices/${id}`, data);
export const deleteNotice = (id) => API.delete(`/notices/${id}`);
