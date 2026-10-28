// Starts the server and the client together with npm run dev.
import net from 'node:net';
import { spawn } from 'node:child_process';

const SERVER_PORT = Number(process.env.PORT || 4000);
const children = [];

function startWorkspace(name) {
  const child = spawn('npm', ['run', 'dev', '-w', name], { stdio: 'inherit', shell: true });
  children.push(child);
}

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

async function waitForServer() {
  for (let tries = 0; tries < 120; tries++) {
    if (await isServerUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.log('[dev] the server has not started after 60 seconds; starting the client anyway');
}

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
