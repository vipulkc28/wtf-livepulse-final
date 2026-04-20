import { apiGet } from './client.js';
export const fetchGymAnalytics = (gymId, dateRange = '30d') => apiGet(`/api/gyms/${gymId}/analytics?dateRange=${dateRange}`);
