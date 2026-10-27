// Start-up file: connects to MongoDB, builds the app, opens the HTTP port and Socket.IO,
// then calls every module's init() so modules can register their services and listen
// for socket events. Run with `npm run dev -w server` (or `npm run dev` at the root).
import http from 'node:http';
import { Server } from 'socket.io';
import { config } from './shared/config/index.js';
import { connectDb } from './shared/db/index.js';
import { services } from './shared/services/registry.js';
import { setupRealtime } from './shared/realtime/socketServer.js';
import { createApp } from './app.js';

// Connect, build and start everything.
async function start() {
  await connectDb(config.mongoUri);
  const { app, modules } = await createApp();

  // Socket.IO shares the same HTTP server (and port) as Express.
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
