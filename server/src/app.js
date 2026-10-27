// Builds the Express app: security middleware, then every module's router, then errors.
// Modules are found automatically: each folder in src/modules with an index.js is
// mounted at /api/<name>. Adding a module never means editing this file.
// server.js uses createApp(); tests use it too, without a real HTTP port.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './shared/config/index.js';
import { apiLimiter } from './shared/middleware/rateLimit.js';
import { errorHandler, notFound } from './shared/middleware/errorHandler.js';

const modulesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'modules');

// Import every modules/<name>/index.js, in alphabetical order, and return their exports.
export async function loadModules() {
  const folderNames = fs.readdirSync(modulesDir).sort();
  const modules = [];
  for (const folderName of folderNames) {
    const indexFile = path.join(modulesDir, folderName, 'index.js');
    if (!fs.existsSync(indexFile)) {
      continue;
    }
    // import() needs a file:// URL, especially on Windows where paths start with C:\
    const loaded = await import(pathToFileURL(indexFile).href);
    modules.push(loaded.default);
  }
  return modules;
}

// Create the Express app and mount all modules. Returns the app and the module list.
export async function createApp() {
  const app = express();
  app.use(helmet());
  // credentials: true lets the browser send the login cookie from the Vite dev server.
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use('/api', apiLimiter);

  const modules = await loadModules();
  for (const mod of modules) {
    app.use(`/api/${mod.name}`, mod.router);
  }

  app.use('/api', notFound);
  app.use(errorHandler);
  return { app, modules };
}
