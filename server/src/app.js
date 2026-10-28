// Builds the Express app and mounts every module's routes.
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

export async function loadModules() {
  const folderNames = fs.readdirSync(modulesDir).sort();
  const modules = [];
  for (const folderName of folderNames) {
    const indexFile = path.join(modulesDir, folderName, 'index.js');
    if (!fs.existsSync(indexFile)) {
      continue;
    }
    const loaded = await import(pathToFileURL(indexFile).href);
    modules.push(loaded.default);
  }
  return modules;
}

export async function createApp() {
  const app = express();
  app.use(helmet());
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
