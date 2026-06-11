import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username, password) => api.post('/auth/login', { username, password });
export const register = (username, password, role) => api.post('/auth/register', { username, password, role });

export const getTables = () => api.get('/tables/');
export const addTable = (table_number) => api.post('/tables/', { table_number });
export const updateTable = (id, data) => api.put(`/tables/${id}`, data);
export const deleteTable = (id) => api.delete(`/tables/${id}`);

export const getMenu = () => api.get('/menu/');
export const addMenuItem = (data) => api.post('/menu/', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

export const getOrders = () => api.get('/orders/');
export const getOrderByTable = (tableId) => api.get(`/orders/table/${tableId}`);
export const createOrUpdateOrder = (data) => api.post('/orders/', data);

export const getBills = () => api.get('/bills/');
export const generateBill = (orderId) => api.post('/bills/generate', { order_id: orderId });
export const getDailyReport = () => api.get('/bills/reports/daily');

export default api;
