import { Router } from 'express';
import { lookupCustomerOrJourney } from '../controllers/customerController.js';
import { validate, customerLookupSchema } from '../middleware/validator.js';

const router = Router();

router.get('/:customer_query', validate(customerLookupSchema, 'params'), lookupCustomerOrJourney);

export default router;

