import mongoose from 'mongoose';
export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Ensure .env.local is loaded or set the env var.');
  }
  await mongoose.connect(uri, { dbName: 'feedsapp' });
}
