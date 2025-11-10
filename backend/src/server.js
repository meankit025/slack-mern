import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

const app = express();

app.get('/', (req, res) => {
  res.send('API is running....');
});

const serverStart = async () => {
  await connectDB();
  console.log(`server is running on port: ${ENV.PORT}`);
};

serverStart();

// m9CbxOV6b4uYk64b
