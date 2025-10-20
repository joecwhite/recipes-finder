import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import { initializeCache, cleanupExpiredCache, getCacheStats } from './services/cacheService';
import recipeRoutes from './routes/recipeRoutes';
import chatRoutes from './routes/chatRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const cacheStats = getCacheStats();
  res.json({
    status: 'healthy',
    environment: config.nodeEnv,
    cache: cacheStats,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize cache on startup
initializeCache();

// Cleanup expired cache entries every hour
setInterval(() => {
  cleanupExpiredCache();
}, 60 * 60 * 1000);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info('Recipe Finder server started', {
    port: PORT,
    environment: config.nodeEnv,
  });
  console.log(`\n🚀 Recipe Finder API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
});

export default app;
