import { MongoClient } from 'mongodb';

let database;

const getDb = async () => {
  if (database) {
    return database;
  }

  const connectionString = process.env.MONGODB_URI;
  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }

  const client = new MongoClient(connectionString);
  await client.connect();
  database = client.db(process.env.MONGODB_DB_NAME || 'practice');
  return database;
};

export { getDb };
