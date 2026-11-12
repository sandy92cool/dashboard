import test from 'node:test';
import assert from 'node:assert/strict';
import { dbManager } from '../src/database/connection.js';
import { analyticsService } from '../src/services/analyticsService.js';
import { journeyService } from '../src/services/journeyService.js';
import { aiService } from '../src/services/aiService.js';

test('DatabaseManager initializes and loads embedded records', async () => {
  await dbManager.initialize();
  const status = dbManager.getStatus();
  assert.equal(status.openmarketCount, 51);
  assert.equal(status.journeysCount, 35);
});

test('AnalyticsService returns correct KPIs and status distributions', async () => {
  const stats = await analyticsService.getSummaryStats();
  assert.equal(stats.kpis.totalLogins, 51);
  assert.equal(stats.kpis.totalApplications, 35);
  assert.ok(stats.kpis.totalSubmissions > 0);
  assert.ok(stats.kpis.conversionRate > 0);
  assert.ok(stats.statusDistribution.APP_SUBMITTED !== undefined);
  assert.ok(stats.statusDistribution.JOURNEY_ACTIVE !== undefined);
  assert.ok(stats.statusDistribution.USER_DROPPED !== undefined);
});

test('AnalyticsService returns product rankings and trending product', async () => {
  const prodStats = await analyticsService.getProductAnalytics();
  assert.ok(prodStats.trendingProduct);
  assert.equal(prodStats.trendingProduct.productCode, 'C2PL');
  assert.ok(prodStats.products.length > 0);
});

test('JourneyService looks up by Application Number', async () => {
  const result = await journeyService.lookupCustomerOrJourney('APP-2026-10001', 'application_number');
  assert.ok(result.primaryJourney);
  assert.equal(result.primaryJourney['Application Number'], 'APP-2026-10001');
  assert.ok(result.customerProfile);
});

test('JourneyService looks up by Mobile Number', async () => {
  const result = await journeyService.lookupCustomerOrJourney('9820010004', 'mobile_number');
  assert.ok(result.customerProfile);
  assert.ok(result.offersGenerated.length > 0);
  assert.ok(result.ineligibleOffers.length > 0);
});

test('AiService generates executive insights and answers queries', async () => {
  const insights = await aiService.getExecutiveInsights('2026-09-28', '2026-10-28');
  assert.ok(insights.insights.length >= 3);
  assert.ok(insights.executiveSummary.length > 0);

  // 1. Trending product query
  const copilotTrending = await aiService.answerCopilotQuery('What is the trending product?');
  assert.ok(copilotTrending.answer.includes('C2PL'));

  // 2. Drop-off bottleneck query
  const copilotDrop = await aiService.answerCopilotQuery('Why are users dropping off?');
  assert.ok(copilotDrop.answer.includes('drop-off') || copilotDrop.answer.includes('Drop'));

  // 3. Strict Anti-Hallucination Guard on out-of-scope questions
  const outOfScope = await aiService.answerCopilotQuery('What is the weather in Tokyo today?');
  assert.ok(outOfScope.answer.includes('this information is not available') || outOfScope.answer.includes('restricted strictly'));
});

