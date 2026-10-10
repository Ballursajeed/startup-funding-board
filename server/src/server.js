require('dotenv').config();
const createApp = require("./app");
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_SECRET is missing from server/.env');

  await connectDB();
  const app = createApp()
  app.listen(port, '0.0.0.0', () => console.log(`API listening on http://0.0.0.0:${port}`));
  
}

start().catch((error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);
});