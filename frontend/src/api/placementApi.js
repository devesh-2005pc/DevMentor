import API from './axiosInstance';

export const predictPlacement = (data) => API.post('/placement/predict', data);
export const getPlacementHistory = () => API.get('/placement/history');
