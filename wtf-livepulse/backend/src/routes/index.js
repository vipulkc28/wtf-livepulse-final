import gymsRoutes from './gyms.routes.js';
import anomaliesRoutes from './anomalies.routes.js';
import simulatorRoutes from './simulator.routes.js';
import analyticsRoutes from './analytics.routes.js';

export function registerRoutes(app) {
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/gyms', gymsRoutes);
  app.use('/api/anomalies', anomaliesRoutes);
  app.use('/api/simulator', simulatorRoutes);
  app.use('/api/analytics', analyticsRoutes);
}
