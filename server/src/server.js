// Starts the server: database, HTTP, Socket.IO and modules.
import http from 'node:http';
import { Server } from 'socket.io';
import { config } from './shared/config/index.js';
import { connectDb } from './shared/db/index.js';
import { services } from './shared/services/registry.js';
import { setupRealtime } from './shared/realtime/socketServer.js';
import { createApp } from './app.js';

async function start() {
  await connectDb(config.mongoUri);
  const { app, modules } = await createApp();

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: config.clientUrl, credentials: true } });
  setupRealtime(io);

  for (const mod of modules) {
    await mod.init({ io, services });
  }
  console.log(`[modules] mounted: ${modules.map((mod) => '/api/' + mod.name).join(', ')}`);

  httpServer.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
