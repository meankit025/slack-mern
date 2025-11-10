import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';

const app = express();

app.get('/', (req, res) => {
  res.send('API is running....');
});

app.listen(ENV.PORT, () => {
  console.log(`server is running on port: ${ENV.PORT}`);
});
