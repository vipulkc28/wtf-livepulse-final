import { allSockets } from './subscriptions.js';

export function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const ws of allSockets()) {
    if (ws.readyState === ws.OPEN) ws.send(message);
  }
}
