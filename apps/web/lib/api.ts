import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vp_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (orgId: string, email: string, password: string) =>
    api.post('/auth/login', { orgId, email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Vendors API
export const vendorsApi = {
  list: (params?: any) => api.get('/vendors', { params }),
  get: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post('/vendors', data),
  update: (id: string, data: any) => api.patch(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
  stats: () => api.get('/vendors/stats'),
};

// Invoices API
export const invoicesApi = {
  list: (params?: any) => api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.patch(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  approve: (id: string, data?: any) => api.post(`/invoices/${id}/approve`, data),
  reject: (id: string, reason?: string) => api.post(`/invoices/${id}/reject`, { reason }),
  markPaid: (id: string) => api.post(`/invoices/${id}/mark-paid`),
  stats: () => api.get('/invoices/stats'),
  uploadFile: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/invoices/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadFile: (id: string) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

// GST API
export const gstApi = {
  register: (params?: any) => api.get('/gst/register', { params }),
  hsn: () => api.get('/gst/hsn'),
  gstr1: () => api.get('/gst/gstr1'),
  gstr3b: () => api.get('/gst/gstr3b'),
  stats: () => api.get('/gst/stats'),
};

// TDS API
export const tdsApi = {
  register: () => api.get('/tds/register'),
  summary: () => api.get('/tds/summary'),
  codes: () => api.get('/tds/codes'),
  stats: () => api.get('/tds/stats'),
};

// Assets API
export const assetsApi = {
  list: () => api.get('/assets'),
  get: (id: string) => api.get(`/assets/${id}`),
  schedule: (id: string) => api.get(`/assets/${id}/schedule`),
  create: (data: any) => api.post('/assets', data),
  update: (id: string, data: any) => api.patch(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
  stats: () => api.get('/assets/stats'),
};

// Export API
export const exportApi = {
  zoho: () => api.get('/exports/zoho'),
  quickbooks: () => api.get('/exports/quickbooks'),
  tally: () => api.get('/exports/tally'),
  audit: () => api.get('/exports/audit-package'),
};