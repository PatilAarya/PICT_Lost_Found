// Demo script that edits a custody entry to show the integrity check works.
import mongoose from 'mongoose';
import { config } from '../src/shared/config/index.js';
import { connectDb, disconnectDb } from '../src/shared/db/index.js';

async function tamper(entries) {
  const target = await entries.findOne({ seq: 2, tamperedFrom: { $exists: false } });
  if (!target) {
    console.log('No entry to tamper with. Run npm run seed first.');
    return;
  }
  await entries.updateOne(
    { _id: target._id },
    { $set: { note: 'Returned to owner (edited)', tamperedFrom: target.note } }
  );
  console.log(`Edited entry seq 2 of item ${target.itemId}. Now run the integrity check.`);
}

async function restore(entries) {
  const tampered = await entries.find({ tamperedFrom: { $exists: true } }).toArray();
  for (const entry of tampered) {
    await entries.updateOne(
      { _id: entry._id },
      { $set: { note: entry.tamperedFrom }, $unset: { tamperedFrom: '' } }
    );
  }
  console.log(`Restored ${tampered.length} entr${tampered.length === 1 ? 'y' : 'ies'}.`);
}

async function main() {
  await connectDb(config.mongoUri);
  const entries = mongoose.connection.collection('custodyentries');
  if (process.argv.includes('--restore')) {
    await restore(entries);
  } else {
    await tamper(entries);
  }
  await disconnectDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
