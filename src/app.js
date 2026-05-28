import express from 'express';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import * as dotenv from 'dotenv';
import URLRouter from './urls/url.js';

dotenv.config();
const app = express();

app.use(express.json());

const initializeServices = async () => {
  await connectRedis();
  await connectDB();
};
initializeServices();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Node.js, Mongo, and Redis are linked!' });
});

app.use('/v1/url', URLRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
