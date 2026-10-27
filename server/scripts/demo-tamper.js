// Demo helper for the viva: secretly edits one custody entry straight in MongoDB,
// skipping the app, to show that the integrity check catches it.
//   node server/scripts/demo-tamper.js            -> tamper with one entry
//   node server/scripts/demo-tamper.js --restore  -> put the original text back
// The original note is saved in a "tamperedFrom" field so --restore can undo it.
import mongoose from 'mongoose';
import { config } from '../src/shared/config/index.js';
import { connectDb, disconnectDb } from '../src/shared/db/index.js';

// Change the note of the second entry of some item, like an insider would.
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

// Undo every tampered entry by restoring its original note.
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

// Connect, run the chosen action on the raw collection, disconnect.
async function main() {
  await connectDb(config.mongoUri);
  // The raw collection skips Mongoose and the app, exactly like a direct database edit.
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
