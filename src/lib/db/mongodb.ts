import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalMongoose = (global as unknown) as { mongoose: MongooseCache };

if (!globalMongoose.mongoose) {
  globalMongoose.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (globalMongoose.mongoose.conn) {
    return globalMongoose.mongoose.conn;
  }

  if (!globalMongoose.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    globalMongoose.mongoose.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    globalMongoose.mongoose.conn = await globalMongoose.mongoose.promise;
  } catch (e) {
    globalMongoose.mongoose.promise = null;
    throw e;
  }

  return globalMongoose.mongoose.conn;
}
