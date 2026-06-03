import API from './axiosInstance';

export const generateRoadmap = (data) => API.post('/roadmap/generate', data);
export const getRoadmapHistory = () => API.get('/roadmap/history');
export const getRoadmap = (id) => API.get(`/roadmap/${id}`);
export const markWeekComplete = (id, weekNum) => API.put(`/roadmap/${id}/week/${weekNum}`);
