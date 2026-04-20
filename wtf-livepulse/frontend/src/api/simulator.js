import { apiPost } from './client.js';
export const startSimulator = (speed) => apiPost('/api/simulator/start', { speed });
export const stopSimulator = () => apiPost('/api/simulator/stop');
export const resetSimulator = () => apiPost('/api/simulator/reset');
