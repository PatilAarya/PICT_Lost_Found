// Starts an in-memory MongoDB for tests.
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

export async function startTestDb() {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
}

export async function clearTestDb() {
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

export async function stopTestDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
