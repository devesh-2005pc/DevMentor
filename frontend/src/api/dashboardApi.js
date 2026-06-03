import API from './axiosInstance';

export const getDashboardOverview = () => API.get('/dashboard/overview');
