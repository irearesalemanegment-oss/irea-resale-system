import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const developersAPI = {
  getAll: (params) => api.get('/developers', { params }),
  getById: (id) => api.get(`/developers/${id}`),
  create: (data) => api.post('/developers', data),
  update: (id, data) => api.put(`/developers/${id}`, data),
  delete: (id) => api.delete(`/developers/${id}`),
};

export const compoundsAPI = {
  getAll: (params) => api.get('/compounds', { params }),
  getById: (id) => api.get(`/compounds/${id}`),
  create: (data) => api.post('/compounds', data),
  update: (id, data) => api.put(`/compounds/${id}`, data),
  delete: (id) => api.delete(`/compounds/${id}`),
};

export const unitsAPI = {
  getAll: (params) => api.get('/units', { params }),
  getById: (id) => api.get(`/units/${id}`),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  delete: (id) => api.delete(`/units/${id}`),
  getStats: () => api.get('/units/stats'),
};

export const imagesAPI = {
  upload: (unitId, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post(`/features/units/${unitId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByUnit: (unitId) => api.get(`/features/units/${unitId}/images`),
  delete: (imageId) => api.delete(`/features/images/${imageId}`),
};

export const phoneAccessAPI = {
  request: (unitId) => api.post(`/features/units/${unitId}/request-phone`),
  check: (unitId) => api.get(`/features/units/${unitId}/phone-access`),
  getAll: (params) => api.get('/features/phone-requests', { params }),
  approve: (id) => api.put(`/features/phone-requests/${id}/approve`),
  reject: (id) => api.put(`/features/phone-requests/${id}/reject`),
};

export const notificationsAPI = {
  get: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const reportsAPI = {
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getStatistics: () => api.get('/reports/statistics'),
  getPriceTrends: (params) => api.get('/reports/trends', { params }),
  getDeveloperPerformance: () => api.get('/reports/developer-performance'),
};

export const exportAPI = {
  exportUnitsToCSV: (params) => api.get('/export/units/csv', { params, responseType: 'blob' }),
  exportUnitsToPDF: (params) => api.get('/export/units/pdf', { params, responseType: 'blob' }),
};
export default api;
