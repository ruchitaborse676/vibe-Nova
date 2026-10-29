import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes.js';
import { connectDB } from './src/server/db.js';
import { initStore } from './src/server/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Connect to database (Atlas if configured, or initial memory DB)
  await connectDB();
  await initStore();

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Vibe-Nova',
      time: new Date().toISOString(),
      timestamp: Date.now(),
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[Vibe-Nova Dev] Vite middleware mounted.`);
  } else {
    // Production mode: Serve built dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vibe-Nova Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Vibe-Nova Server] Failed to start:', err);
  process.exit(1);
});
