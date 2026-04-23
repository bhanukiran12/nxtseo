import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// Blogs
export const generateBlog = (data) => api.post('/blogs/generate', data);
export const getBlogs = (params) => api.get('/blogs', { params });
export const getBlog = (id) => api.get(`/blogs/${id}`);
export const updateBlog = (id, data) => api.patch(`/blogs/${id}`, data);
export const publishBlog = (id, data) => api.post(`/blogs/${id}/publish`, data);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

// Backlinks
export const getBacklinks = (params) => api.get('/backlinks', { params });
export const addBacklink = (data) => api.post('/backlinks', data);
export const updateBacklink = (id, data) => api.patch(`/backlinks/${id}`, data);
export const deleteBacklink = (id) => api.delete(`/backlinks/${id}`);

// Outreach
export const getOutreach = (params) => api.get('/outreach', { params });
export const discoverWebsites = (data) => api.post('/outreach/discover', data);
export const generateEmail = (data) => api.post('/outreach/generate-email', data);
export const saveOutreach = (data) => api.post('/outreach', data);
export const createDraft = (id) => api.post(`/outreach/${id}/draft`);
export const updateOutreach = (id, data) => api.patch(`/outreach/${id}`, data);
export const deleteOutreach = (id) => api.delete(`/outreach/${id}`);

// GSC
export const getGSCPerformance = (params) => api.get('/gsc/performance', { params });

// Auth
export const getAuthUrl = () => api.get('/auth/google');
export const getAuthStatus = () => api.get('/auth/status');
export const logout = () => api.post('/auth/logout');

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Settings
export const getSettings = () => api.get('/settings');
export const saveSettings = (data) => api.post('/settings', data);

export default api;
