const mongoose = require('mongoose');

let usingMemoryStore = false;


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    usingMemoryStore = false;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    usingMemoryStore = true;
    console.warn('Using in-memory development store until MongoDB is reachable.');
    return false;
  }
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;
const isUsingMemoryStore = () => usingMemoryStore || !isDatabaseReady();

module.exports = { connectDB, isDatabaseReady, isUsingMemoryStore };
