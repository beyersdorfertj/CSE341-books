import app from './app.js';
import { getDb } from './src/db/connect.js';
const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT is not defined. Make sure your local npm scripts reference the .env file with --env-file=.env, or define PORT in your hosted environment settings.');
}

const startServer = async () => {
  try {
    await getDb();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();