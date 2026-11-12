import { Router } from 'express';
import { getStats, getProductAnalytics } from '../controllers/analyticsController.js';
import { validate, statsQuerySchema } from '../middleware/validator.js';

const router = Router();

router.get('/stats', validate(statsQuerySchema, 'query'), getStats);
router.get('/products/analytics', validate(statsQuerySchema, 'query'), getProductAnalytics);

export default router;

