import mongoose from 'mongoose';

// Connects to MongoDB. The database container can take a few seconds to be ready,
// so we try a few times before giving up.
export async function connectDB(uri, { retries = 5, delayMs = 2000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Give up on this attempt after 5 seconds instead of Mongoose's default 30.
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB');
      return mongoose.connection;
    } catch (error) {
      console.error(`MongoDB connection failed (attempt ${attempt} of ${retries}): ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export function isDBConnected() {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
