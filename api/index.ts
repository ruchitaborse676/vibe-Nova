import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../src/server/routes.js';
import { connectDB } from '../src/server/db.js';
import { initStore } from '../src/server/store.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serverless warm-up handler
app.use(async (req, res, next) => {
  await connectDB();
  await initStore();
  next();
});

app.use('/api', apiRouter);

export default app;
