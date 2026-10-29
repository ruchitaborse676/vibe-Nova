import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import { initStore, resetAndSeedStore } from './store.js';

async function runSeed() {
  console.log('[Vibe-Nova Seed] Initializing database seeding...');
  await connectDB();
  const res = await resetAndSeedStore();
  console.log('[Vibe-Nova Seed] Seed completed successfully:', res.message);
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[Vibe-Nova Seed] Seed error:', err);
  process.exit(1);
});
