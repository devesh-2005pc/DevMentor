import API from './axiosInstance';

export const generateProjects = (data) => API.post('/projects/generate', data);
export const getProjectHistory = () => API.get('/projects/history');
