const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurosyncai';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB not running on 27017 (${error.message}). Starting in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
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
    } catch (memErr) {
      console.error(`MongoDB Connection Error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
