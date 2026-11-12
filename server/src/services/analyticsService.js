import { dbManager } from '../database/connection.js';
import { PROD_STATUSES, PRODUCT_CATALOG } from '../config/constants.js';

export class AnalyticsService {
  /**
   * Calculates overall summary metrics and status distributions with optional date range filter.
   */
  async getSummaryStats(startDate, endDate) {
    const openCol = dbManager.getCollection('openmarketjourneys');
    const jourCol = dbManager.getCollection('journeys');

    let openDocs = await openCol.find().toArray();
    let jourDocs = await jourCol.find().toArray();

    // Date range filtering
    if (startDate || endDate) {
      openDocs = openDocs.filter(d => {
        const dt = String(d.Created || d.Updated || '').slice(0, 10);
        if (!dt) return true;
        if (startDate && dt < startDate) return false;
        if (endDate && dt > endDate) return false;
        return true;
      });

      jourDocs = jourDocs.filter(j => {
        const dt = String(j['Journey Started'] || j.Dropped || '').slice(0, 10);
        if (!dt) return true;
        if (startDate && dt < startDate) return false;
        if (endDate && dt > endDate) return false;
        return true;
      });
    }

    const totalLogins = openDocs.length;
    const totalApplications = jourDocs.length;

    // Status breakdown for all 5 PROD statuses
    const statusCounts = {};
    for (const st of PROD_STATUSES) {
      statusCounts[st] = 0;
    }

    let totalSubmissions = 0;
    for (const j of jourDocs) {
      const st = String(j.Status || '').trim();
      if (st === 'APP_SUBMITTED') totalSubmissions += 1;
      if (statusCounts[st] !== undefined) {
        statusCounts[st] += 1;
      } else if (st) {
        statusCounts[st] = (statusCounts[st] || 0) + 1;
      }
    }

    const conversionRate = totalLogins > 0
      ? Number(((totalSubmissions / totalLogins) * 100).toFixed(1))
      : 0;

    return {
      period: {
        startDate: startDate || 'All',
        endDate: endDate || 'All'
      },
      kpis: {
        totalLogins,
        totalSubmissions,
        totalApplications,
        conversionRate,
        activeApplications: statusCounts.JOURNEY_ACTIVE || 0,
        droppedApplications: (statusCounts.USER_DROPPED || 0) + (statusCounts.OFFER_EXPIRED || 0),
        completedJourneys: statusCounts.JORUNEY_COMPLETE || 0
      },
      statusDistribution: statusCounts
    };
  }

  /**
   * Calculates product-level analytics: submissions, trending product, age groups, and locations.
   */
  async getProductAnalytics(startDate, endDate) {
    const jourCol = dbManager.getCollection('journeys');
    let jourDocs = await jourCol.find().toArray();

    if (startDate || endDate) {
      jourDocs = jourDocs.filter(j => {
        const dt = String(j['Journey Started'] || j.Dropped || '').slice(0, 10);
        if (!dt) return true;
        if (startDate && dt < startDate) return false;
        if (endDate && dt > endDate) return false;
        return true;
      });
    }

    const productStats = {};
    for (const code of Object.keys(PRODUCT_CATALOG)) {
      productStats[code] = {
        productCode: code,
        name: PRODUCT_CATALOG[code].name,
        category: PRODUCT_CATALOG[code].category,
        totalApplications: 0,
        submissions: 0,
        ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
        locations: {}
      };
    }

    for (const j of jourDocs) {
      const prod = String(j.Product || '').trim();
      if (!prod) continue;

      if (!productStats[prod]) {
        productStats[prod] = {
          productCode: prod,
          name: prod,
          category: 'Insurance',
          totalApplications: 0,
          submissions: 0,
          ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
          locations: {}
        };
      }

      productStats[prod].totalApplications += 1;
      const st = String(j.Status || '').trim();
      if (st === 'APP_SUBMITTED') {
        productStats[prod].submissions += 1;
      }

      // Age group aggregation
      const ageGroup = String(j.Age_Group || '');
      if (productStats[prod].ageGroups[ageGroup] !== undefined) {
        productStats[prod].ageGroups[ageGroup] += 1;
      } else {
        productStats[prod].ageGroups['26-35'] += 1; // default fallback
      }

      // Location aggregation
      const loc = String(j.Location || j.City || 'Mumbai').trim();
      if (loc) {
        productStats[prod].locations[loc] = (productStats[prod].locations[loc] || 0) + 1;
      }
    }

    // Rank products and determine trending product
    const rankedProducts = Object.values(productStats)
      .filter(p => p.totalApplications > 0)
      .sort((a, b) => (b.submissions * 10 + b.totalApplications) - (a.submissions * 10 + a.totalApplications));

    const trendingProduct = rankedProducts.length > 0 ? rankedProducts[0] : null;

    return {
      period: {
        startDate: startDate || 'All',
        endDate: endDate || 'All'
      },
      trendingProduct: trendingProduct
        ? {
            productCode: trendingProduct.productCode,
            name: trendingProduct.name,
            totalApplications: trendingProduct.totalApplications,
            submissions: trendingProduct.submissions,
            submissionRate: trendingProduct.totalApplications > 0
              ? Number(((trendingProduct.submissions / trendingProduct.totalApplications) * 100).toFixed(1))
              : 0
          }
        : null,
      products: rankedProducts
    };
  }
}

export const analyticsService = new AnalyticsService();

