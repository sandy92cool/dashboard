import { analyticsService } from '../services/analyticsService.js';

export async function getStats(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const stats = await analyticsService.getSummaryStats(start_date, end_date);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getProductAnalytics(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const analytics = await analyticsService.getProductAnalytics(start_date, end_date);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

