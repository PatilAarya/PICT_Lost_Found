// Starts the server and the client together with one command: npm run dev.
// We use Node's own child_process and net modules instead of an extra package.
// The client starts only once the server answers on port 4000, so an open browser tab
// never tries to connect too early (that used to print a harmless ECONNREFUSED error).
// Each child prints into this terminal; pressing Ctrl+C stops both.
import net from 'node:net';
import { spawn } from 'node:child_process';

const SERVER_PORT = Number(process.env.PORT || 4000);
const children = [];

// Start one workspace's "dev" script and pipe its output to this terminal.
function startWorkspace(name) {
  // shell: true lets Windows find npm.cmd as well as macOS and Linux find npm.
  const child = spawn('npm', ['run', 'dev', '-w', name], { stdio: 'inherit', shell: true });
  children.push(child);
}

// Try to open a connection to the server. Resolves true if something is listening.
function isServerUp() {
  return new Promise((resolve) => {
    const socket = net.connect(SERVER_PORT, '127.0.0.1');
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

// Check every half second until the server is up (or 60 seconds have passed).
async function waitForServer() {
  for (let tries = 0; tries < 120; tries++) {
    if (await isServerUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.log('[dev] the server has not started after 60 seconds; starting the client anyway');
}

// Stop every child when this script is stopped.
function stopAll() {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

startWorkspace('server');
await waitForServer();
startWorkspace('client');
