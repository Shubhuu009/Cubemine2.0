const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to your .env file.');
  }

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, isDatabaseReady };
