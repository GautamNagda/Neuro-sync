const mongoose = require('mongoose');

let mongod = null;
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const isVercel = !!process.env.VERCEL;
    const uri = process.env.MONGO_URI || (!isVercel ? 'mongodb://127.0.0.1:27017/neurosyncai' : null);

    if (!uri && isVercel) {
      throw new Error('MONGO_URI is not defined. Please add MONGO_URI in your Vercel Project Environment Variables.');
    }

    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      if (!isVercel) {
        console.warn(`⚠️ Local MongoDB not running on 27017 (${error.message}). Starting in-memory MongoDB...`);
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          if (!mongod) {
            mongod = await MongoMemoryServer.create();
          }
          const memUri = mongod.getUri() + 'neurosyncai';
          process.env.MONGO_URI = memUri;
          const conn = await mongoose.connect(memUri);
          console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);

          try {
            const seed = require('../seedData');
            await seed(memUri);
            console.log('✅ In-memory database auto-seeded successfully!');
          } catch (seedErr) {
            console.warn('Auto-seed warning:', seedErr.message);
          }
          return conn;
        } catch (memErr) {
          console.error(`In-Memory MongoDB Error: ${memErr.message}`);
          throw memErr;
        }
      } else {
        console.error(`MongoDB Connection Error on Vercel: ${error.message}`);
        throw error;
      }
    }
  })();

  try {
    const res = await connectionPromise;
    return res;
  } finally {
    if (mongoose.connection.readyState !== 1) {
      connectionPromise = null;
    }
  }
};

module.exports = connectDB;
