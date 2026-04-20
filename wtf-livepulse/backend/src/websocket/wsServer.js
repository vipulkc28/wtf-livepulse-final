import { WebSocketServer } from 'ws';
import { env } from '../config/env.js';
import { addSocket, removeSocket, allSockets } from './subscriptions.js';
import { attachHeartbeat } from './heartbeat.js';

let wss;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: env.wsPath });

  wss.on('connection', (ws) => {
    addSocket(ws);
    attachHeartbeat(ws);
    ws.send(JSON.stringify({ type: 'CONNECTED', ts: new Date().toISOString() }));
    ws.on('close', () => removeSocket(ws));
  });

  setInterval(() => {
    for (const ws of allSockets()) {
      if (!ws.isAlive) {
        ws.terminate();
        removeSocket(ws);
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000).unref();

  return wss;
}
