import API from './axiosInstance';

export const uploadResume = (formData) =>
  API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getResumeHistory = () => API.get('/resume/history');
export const getResumeAnalysis = (id) => API.get(`/resume/${id}`);
