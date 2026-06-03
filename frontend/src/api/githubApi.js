import API from './axiosInstance';

export const connectGithub = (username) => API.post('/github/connect', { username });
export const getGithubStats = () => API.get('/github/stats');
export const refreshGithubStats = () => API.post('/github/refresh');
