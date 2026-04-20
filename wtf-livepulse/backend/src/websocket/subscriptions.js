const sockets = new Set();
export function addSocket(ws) { sockets.add(ws); }
export function removeSocket(ws) { sockets.delete(ws); }
export function allSockets() { return sockets; }
