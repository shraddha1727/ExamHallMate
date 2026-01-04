import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'spi';

if (!uri) {
  console.error('FATAL: MONGODB_URI is not defined in the environment variables. Please check your .env file.');
  process.exit(1);
}

let cachedDb: Db | null = null;

export async function getDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('MongoDB connection successful.');
    
    const db = client.db(dbName);
    cachedDb = db;
    
    // Gracefully close the connection when the app exits
    process.on('SIGINT', async () => {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    });

    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to the database.');
  }
}

// Note: The default export is removed in favor of the named export 'getDB'.
// We will update server.ts to use this new function.