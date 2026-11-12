import { journeyService } from '../services/journeyService.js';

export async function lookupCustomerOrJourney(req, res, next) {
  try {
    const { customer_query } = req.params;
    const { search_type } = req.query;
    const result = await journeyService.lookupCustomerOrJourney(customer_query, search_type);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

