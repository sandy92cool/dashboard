import { Router } from 'express';
import analyticsRoutes from './analyticsRoutes.js';
import customerRoutes from './customerRoutes.js';
import aiRoutes from './aiRoutes.js';
import { dbManager } from '../database/connection.js';

const apiRouter = Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbManager.getStatus()
  });
});

apiRouter.use('/', analyticsRoutes);
apiRouter.use('/customer', customerRoutes);
apiRouter.use('/ai', aiRoutes);

export default apiRouter;

