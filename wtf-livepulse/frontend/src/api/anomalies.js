import { apiGet } from './client.js';
export const fetchAnomalies = () => apiGet('/api/anomalies');
