// Helpers for tests: start a throw-away MongoDB in memory, empty it between tests,
// and stop it at the end. Tests never touch your real database.
// Used by every *.test.js file in the server.
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

// Start an in-memory MongoDB and connect Mongoose to it.
export async function startTestDb() {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
}

// Delete every document in every collection.
export async function clearTestDb() {
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

// Disconnect and shut the in-memory MongoDB down.
export async function stopTestDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
