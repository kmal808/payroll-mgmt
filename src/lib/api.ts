import axios from 'axios';
import { PayrollWeek } from '../types/payroll';

// Remove /api from the base URL since we'll add it in the routes
const baseURL = import.meta.env.VITE_API_URL.endsWith('/api')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    return data;
  },
  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};

export const payroll = {
  create: async (payrollData: PayrollWeek) => {
    const { data } = await api.post('/payroll', payrollData);
    return data;
  },
  getAll: async () => {
    const { data } = await api.get('/payroll');
    return data as PayrollWeek[];
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/payroll/${id}`);
    return data as PayrollWeek;
  },
  update: async (id: string, payrollData: PayrollWeek) => {
    const { data } = await api.put(`/payroll/${id}`, payrollData);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/payroll/${id}`);
  }
};

export default api;