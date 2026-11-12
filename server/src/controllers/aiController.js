import { aiService } from '../services/aiService.js';

export async function getAiInsights(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const insights = await aiService.getExecutiveInsights(start_date, end_date);
    res.json(insights);
  } catch (err) {
    next(err);
  }
}

export async function askAi(req, res, next) {
  try {
    const { query, start_date, end_date } = req.body;
    const answer = await aiService.answerCopilotQuery(query, start_date, end_date);
    res.json(answer);
  } catch (err) {
    next(err);
  }
}

