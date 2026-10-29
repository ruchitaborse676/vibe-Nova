import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    // MongoDB URI not configured yet; store will use active memory database
    return false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = conn.connection.readyState === 1;
    console.log(`[Vibe-Nova DB] Connected to MongoDB Atlas at host: ${conn.connection.host}`);
    return isConnected;
  } catch (error) {
    console.warn('[Vibe-Nova DB] MongoDB connection failed. Falling back to active local store:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDbInfo() {
  const uri = process.env.MONGODB_URI;
  const configured = Boolean(uri && uri.trim().length > 0);
  const connected = isDbConnected();

  let maskedUri = '';
  if (configured && uri) {
    try {
      maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    } catch {
      maskedUri = 'Configured (Masked)';
    }
  }

  return {
    engine: connected ? 'MongoDB Atlas (Live)' : 'In-Memory / Local Store (Active)',
    configured,
    connected,
    maskedUri: maskedUri || 'Not set (using zero-setup high speed in-memory store)',
  };
}
