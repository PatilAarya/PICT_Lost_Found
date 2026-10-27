// Opens and closes the MongoDB connection through Mongoose.
// server.js calls connectDb() once at start-up; the seed script and tests use it too.
// All models in shared/models and in each module share this one connection.
import mongoose from 'mongoose';

// Connect to MongoDB at the given address.
export async function connectDb(uri) {
  await mongoose.connect(uri);
  console.log('[db] connected');
}

// Close the connection (used by the seed script and by tests).
export async function disconnectDb() {
  await mongoose.disconnect();
}
