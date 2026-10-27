// Starts the server and the client together with one command: npm run dev.
// We use Node's own child_process instead of an extra package, so there is nothing new to learn.
// Each child prints into this terminal; pressing Ctrl+C stops both.
import { spawn } from 'node:child_process';

// Start one workspace's "dev" script and pipe its output to this terminal.
function startWorkspace(name) {
  // shell: true lets Windows find npm.cmd as well as macOS and Linux find npm.
  return spawn('npm', ['run', 'dev', '-w', name], { stdio: 'inherit', shell: true });
}

const children = [startWorkspace('server'), startWorkspace('client')];

// Stop every child when this script is stopped.
function stopAll() {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
