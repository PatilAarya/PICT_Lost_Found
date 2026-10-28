// Fills the database with demo data from every module.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config } from '../src/shared/config/index.js';
import { connectDb, disconnectDb } from '../src/shared/db/index.js';

const modulesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'modules');

async function runSeeds() {
  await connectDb(config.mongoUri);
  const folderNames = fs.readdirSync(modulesDir).sort();
  for (const folderName of folderNames) {
    const seedFile = path.join(modulesDir, folderName, 'seed.js');
    if (!fs.existsSync(seedFile)) {
      continue;
    }
    const seedModule = await import(pathToFileURL(seedFile).href);
    await seedModule.default();
    console.log(`[seed] ${folderName} done`);
  }
  await disconnectDb();
}

runSeeds().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
