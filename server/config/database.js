import mongoose from 'mongoose';
import 'dotenv/config';

// Cached connection
let cachedConnection = null;

async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedConnection) {
    return cachedConnection;
  }
  
  // Set up mongoose connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Connected to MongoDB');
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function closeConnection() {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    cachedConnection = null;
  }
}
function getCollection(collectionName) {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection not established. Call connectToDatabase() first.');
  }
  
  return mongoose.connection.db.collection(collectionName);
}

export {
  connectToDatabase,
  closeConnection,
  getCollection,
  mongoose
};