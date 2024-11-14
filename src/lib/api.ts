import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request setup error:', error);
  return Promise.reject({ error: 'Failed to setup request' });
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || 'Server error occurred';
      console.error('Server error:', errorMessage);
      return Promise.reject({ error: errorMessage });
    }
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject({ error: 'Request timed out. Please try again.' });
    }
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({ error: 'Unable to connect to server. Please check your connection.' });
    }
    return Promise.reject({ error: 'An unexpected error occurred' });
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  register: async (email: string, password: string, name: string) => {
    try {
      const { data } = await api.post('/auth/register', { email, password, name });
      return data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error: any) {
      console.error('Password change failed:', error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};

export const payroll = {
  create: async (payrollData: any) => {
    try {
      const { data } = await api.post('/payroll', payrollData);
      return data;
    } catch (error: any) {
      console.error('Failed to create payroll:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const { data } = await api.get('/payroll');
      return data;
    } catch (error: any) {
      console.error('Failed to fetch payroll data:', error);
      throw error;
    }
  }
};

export default api;