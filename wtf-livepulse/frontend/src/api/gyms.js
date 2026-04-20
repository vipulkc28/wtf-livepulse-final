import { apiGet } from './client.js';
export const fetchGyms = () => apiGet('/api/gyms');
export const fetchGymLive = (gymId) => apiGet(`/api/gyms/${gymId}/live`);
