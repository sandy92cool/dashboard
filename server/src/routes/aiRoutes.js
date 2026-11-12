import { Router } from 'express';
import { getAiInsights, askAi } from '../controllers/aiController.js';
import { validate, aiAskSchema, statsQuerySchema } from '../middleware/validator.js';

const router = Router();

router.get('/insights', validate(statsQuerySchema, 'query'), getAiInsights);
router.post('/ask', validate(aiAskSchema, 'body'), askAi);

export default router;

