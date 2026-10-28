// Connects to and disconnects from MongoDB.
import mongoose from 'mongoose';

export async function connectDb(uri) {
  await mongoose.connect(uri);
  console.log('[db] connected');
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
