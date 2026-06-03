import API from './axiosInstance';

export const startInterview = (data) => API.post('/interview/start', data);
export const submitAnswer = (data) => API.post('/interview/answer', data);
export const getInterviewResults = () => API.get('/interview/results');
export const getInterviewResult = (id) => API.get(`/interview/${id}`);
