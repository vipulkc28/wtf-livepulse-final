import express from 'express';
import cors from 'cors';
import http from 'http';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { registerRoutes } from './routes/index.js';
import { initWebSocketServer } from './websocket/wsServer.js';
import { startAnomalyDetector } from './jobs/anomalyDetector.js';
import { startSimulator } from './jobs/simulator.js';
import { startMaterializedViewRefresh } from './jobs/refreshMaterializedViews.js';
import { ensureSeeded } from './db/seeds/seed.js';
import { runAnomalySweep } from './services/anomalyService.js';

const app = express();
app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());
app.use(requestLogger);
registerRoutes(app);
app.use(errorHandler);

const server = http.createServer(app);

async function bootstrap() {
  console.log('Bootstrapping backend...');
  const seedResult = await ensureSeeded();
  console.log('Seed status:', seedResult);
  initWebSocketServer(server);
  startAnomalyDetector();
  startSimulator();
  startMaterializedViewRefresh();
  await runAnomalySweep(new Date());
  server.listen(env.port, () => {
    console.log(`backend listening on ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Fatal bootstrap error', error);
  process.exit(1);
});
