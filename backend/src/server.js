import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './config/inngest.js';
import chatRoutes from './routes/chat.routes.js';
import '../instrument.mjs';
import * as Sentry from '@sentry/node';

const app = express();

app.use(express.json());
app.use(clerkMiddleware()); // req.auth will now be available in req object

app.get('/', (req, res) => {
  res.send('API is running....');
});

app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/chat', chatRoutes);

Sentry.setupExpressErrorHandler(app);

const serverStart = async () => {
  try {
    await connectDB();
    if (ENV.NODE_ENV !== 'production') {
      app.listen(ENV.PORT, () => {
        console.log(`server is listening on port: ${ENV.PORT}`);
      });
    }
  } catch (error) {
    console.error(`Error starting the server`, error);
    process.exit(1);
  }
};

serverStart();

export default app;

// m9CbxOV6b4uYk64b
