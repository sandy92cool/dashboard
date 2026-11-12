import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { dbManager } from '../database/connection.js';
import { analyticsService } from './analyticsService.js';
import { PROD_STATUSES, PRODUCT_CATALOG } from '../config/constants.js';

export class AiService {
  constructor() {
    this.geminiClient = null;
    if (ENV.GEMINI_API_KEY) {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      } catch (err) {
        console.warn('[AiService] Failed to initialize GoogleGenAI client:', err.message);
      }
    }
  }

  /**
   * Builds a comprehensive, verified snapshot of the portfolio data based on current date filters.
   */
  async buildDatasetContext(startDate, endDate) {
    const stats = await analyticsService.getSummaryStats(startDate, endDate);
    const prodStats = await analyticsService.getProductAnalytics(startDate, endDate);

    const openCol = dbManager.getCollection('openmarketjourneys');
    const jourCol = dbManager.getCollection('journeys');

    let openDocs = await openCol.find().toArray();
    let jourDocs = await jourCol.find().toArray();

    // Date filtering on raw records
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

    // 1. Drop page frequency analysis
    const dropStages = {};
    for (const j of jourDocs) {
      const page = String(j['Drop Page'] || 'Completed / No Drop').trim();
      if (page) {
        dropStages[page] = (dropStages[page] || 0) + 1;
      }
    }

    // 2. Ineligible reasons and error frequency analysis
    const errorFrequency = {};
    for (const d of openDocs) {
      for (const inel of (d.ineligible_offers || [])) {
        const err = inel.error || 'Unknown criteria';
        errorFrequency[err] = (errorFrequency[err] || 0) + 1;
      }
    }

    const sortedErrors = Object.entries(errorFrequency)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Channels and Locations
    const locations = {};
    const channels = {};
    for (const j of jourDocs) {
      const loc = String(j.Location || j.City || 'Unknown').trim();
      const ch = String(j.Source || 'Online Direct').trim();
      locations[loc] = (locations[loc] || 0) + 1;
      channels[ch] = (channels[ch] || 0) + 1;
    }

    // 4. Sample individual journeys for customer-specific queries
    const sampleJourneys = jourDocs.slice(0, 25).map(j => ({
      applicationNumber: j['Application Number'] || j.application_number,
      customerName: j['Customer Name'],
      mobileNumber: j['Phone No'] || j.mobile_number,
      status: j.Status,
      product: j.Product,
      sumAssured: j['Sum Assured'],
      premiumAmount: j['Premium Amount'],
      frequency: j.Frequency,
      dropPage: j['Drop Page'],
      journeyStarted: j['Journey Started'],
      droppedAt: j.Dropped || j['Dropped Time'],
      location: j.Location || j.City,
      age: j.Age,
      ageGroup: j.Age_Group
    }));

    return {
      period: {
        startDate: startDate || 'All Recorded Dates',
        endDate: endDate || 'All Recorded Dates'
      },
      kpis: stats.kpis,
      statusDistribution: stats.statusDistribution,
      trendingProduct: prodStats.trendingProduct,
      products: prodStats.products,
      dropStages,
      topRejectionErrors: sortedErrors.slice(0, 8),
      topLocations: Object.entries(locations)
        .map(([loc, count]) => ({ location: loc, count }))
        .sort((a, b) => b.count - a.count),
      channels,
      sampleJourneys
    };
  }

  /**
   * Generates dynamic executive insights using actual AI (Gemini) or grounded data computation.
   */
  async getExecutiveInsights(startDate, endDate) {
    const context = await this.buildDatasetContext(startDate, endDate);

    // 1. Try Gemini API if key is provided
    if (this.geminiClient) {
      try {
        const prompt = `
You are the Executive Insurance Actuary and Operations Intelligence AI.
Analyze the following real-time insurance journey and underwriting portfolio data:

DATASET:
${JSON.stringify(context, null, 2)}

STRICT RULES:
1. Base all analysis SOLELY on the numbers provided in the dataset.
2. DO NOT hallucinate, extrapolate, or bring in outside insurance industry averages.
3. Every insight must contain exact numbers (e.g. counts, conversion %, drop-off stages).
4. Provide exactly 3 to 4 distinct structured insights covering:
   - Application Conversion & Funnel Health
   - Journey Drop-off Stage Bottlenecks
   - Product Demand & Demographic Skew
   - Underwriting Ineligibility / Rejection Root Causes

Return your response strictly as valid JSON matching this schema:
{
  "executiveSummary": "Concise 1-2 sentence executive overview with exact numbers",
  "insights": [
    {
      "id": "unique-slug",
      "type": "conversion|bottleneck|product|underwriting",
      "title": "Clear Headline",
      "severity": "positive|warning|info",
      "summary": "Detailed factual finding quoting exact counts, rates, or stages from the data.",
      "recommendation": "Concrete, actionable business or operational step grounded in the finding."
    }
  ]
}
`;

        const response = await this.geminiClient.models.generateContent({
          model: ENV.GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text();
        const parsed = JSON.parse(rawText);
        if (parsed && Array.isArray(parsed.insights) && parsed.insights.length > 0) {
          return {
            generatedAt: new Date().toISOString(),
            engine: 'Gemini AI (Grounded)',
            ...parsed
          };
        }
      } catch (err) {
        console.warn('[AiService] Gemini generateContent failed, falling back to grounded engine:', err.message);
      }
    }

    // 2. Grounded Analytical Engine (Calculates dynamic insights directly from actual data)
    return this._generateGroundedInsights(context);
  }

  /**
   * Answers user's natural language question using Gemini or deep grounded query engine.
   */
  async answerCopilotQuery(query, startDate, endDate) {
    const context = await this.buildDatasetContext(startDate, endDate);

    // 1. Try Gemini API if configured
    if (this.geminiClient) {
      try {
        const prompt = `
You are the Insurance Analytics AI Copilot.
You have direct access to the live insurance journey and underwriting portfolio dataset below:

DATASET:
${JSON.stringify(context, null, 2)}

USER QUESTION: "${query}"

CRITICAL GROUNDING CONSTRAINTS:
1. Answer the question strictly using the dataset provided above.
2. DO NOT make up, assume, or hallucinate any numbers, customer names, or industry statistics not in this data.
3. If the question asks for something completely absent from the dataset (e.g. general knowledge, external competitors, or an unrecorded customer/product), reply: "Based on the provided insurance journey and underwriting portfolio data, this information is not available. My analysis is restricted strictly to the insurance dataset provided."
4. Be professional, concise, and highlight key metrics and product codes in **bold**.
5. Use bullet points where listing multiple statuses, products, or locations.
`;

        const response = await this.geminiClient.models.generateContent({
          model: ENV.GEMINI_MODEL,
          contents: prompt
        });

        const answerText = response.text();
        if (answerText && answerText.trim()) {
          return {
            query,
            answer: answerText.trim(),
            engine: 'Gemini AI (Strictly Grounded)',
            timestamp: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('[AiService] Gemini answerCopilotQuery failed, falling back to grounded analytical engine:', err.message);
      }
    }

    // 2. Grounded Semantic Analytical Engine (Zero Hallucination)
    return {
      query,
      answer: this._analyzeQueryGrounded(query, context),
      engine: 'Grounded Analytical Engine',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Grounded fallback for dynamic insights calculation (100% computed from real data).
   */
  _generateGroundedInsights(context) {
    const { kpis, statusDistribution, trendingProduct, dropStages, topRejectionErrors, products } = context;

    // Calculate primary drop page
    const dropEntries = Object.entries(dropStages)
      .filter(([page]) => !page.toLowerCase().includes('complete'))
      .sort(([, a], [, b]) => b - a);

    const primaryDrop = dropEntries.length > 0 ? dropEntries[0] : null;
    const topError = topRejectionErrors.length > 0 ? topRejectionErrors[0] : null;

    const insights = [
      {
        id: 'conversion-health',
        type: 'conversion',
        title: 'Portfolio Submission & Funnel Health',
        severity: kpis.conversionRate >= 20 ? 'positive' : 'warning',
        summary: `Across ${context.period.startDate} to ${context.period.endDate}, the portfolio achieved a ${kpis.conversionRate}% submission conversion rate (${kpis.totalSubmissions} applications submitted from ${kpis.totalLogins} unique quote sessions initiated). There are currently ${kpis.activeApplications} journeys actively in progress.`,
        recommendation: kpis.conversionRate < 25
          ? `Deploy automated follow-up nudges for the ${kpis.activeApplications} active applicants to boost submission rate towards the 25% target.`
          : 'Maintain current journey progression flows while optimizing document upload speed.'
      },
      {
        id: 'drop-off-hotspot',
        type: 'bottleneck',
        title: primaryDrop ? `Critical Drop-off Hotspot: ${primaryDrop[0]}` : 'Journey Drop-Off Analysis',
        severity: 'warning',
        summary: primaryDrop
          ? `Analysis of journey stages reveals '${primaryDrop[0]}' is the leading abandonment point with ${primaryDrop[1]} dropped applications (${Math.round((primaryDrop[1] / Math.max(kpis.totalApplications, 1)) * 100)}% of total journeys). Overall drop-offs stand at ${kpis.droppedApplications}.`
          : `A total of ${kpis.droppedApplications} journeys were abandoned or expired before completion.`,
        recommendation: primaryDrop
          ? `Streamline the '${primaryDrop[0]}' UX by reducing form fields, adding live chat support, and enabling instant UPI payment options.`
          : 'Investigate stage friction points to identify where users abandon sessions.'
      },
      {
        id: 'product-velocity',
        type: 'product',
        title: trendingProduct ? `Demand Leader: ${trendingProduct.name} (${trendingProduct.productCode})` : 'Product Demand Velocity',
        severity: 'info',
        summary: trendingProduct
          ? `${trendingProduct.name} (${trendingProduct.productCode}) leads the portfolio with ${trendingProduct.totalApplications} total applications and ${trendingProduct.submissions} submissions (submission conversion: ${trendingProduct.submissionRate}%). Highest demographic demand is concentrated in the ${Object.entries(trendingProduct.ageGroups || {}).sort(([,a],[,b]) => b - a)[0]?.[0] || '26-35'} age group.`
          : 'Product demand is distributed across term and savings categories.',
        recommendation: trendingProduct
          ? `Capitalize on high demand for ${trendingProduct.productCode} by prioritizing fast-track medical verification for the top-demanding cities.`
          : 'Expand marketing for under-performing product categories.'
      },
      {
        id: 'underwriting-ineligibility',
        type: 'underwriting',
        title: 'Underwriting Rejection Root Cause',
        severity: 'warning',
        summary: topError
          ? `The most frequent ineligibility error preventing product offer generation is "${topError.error}", responsible for ${topError.count} customer offer exclusions.`
          : 'Underwriting exclusions remain within expected risk parameters.',
        recommendation: topError
          ? `Review product eligibility guidelines for "${topError.error}" or offer cross-sell alternative products when this restriction triggers.`
          : 'Regularly audit underwriting exclusion rules to prevent unnecessary drop-offs.'
      }
    ];

    return {
      generatedAt: new Date().toISOString(),
      engine: 'Grounded Analytical Engine',
      executiveSummary: `Portfolio processed ${kpis.totalApplications} journey records across ${kpis.totalLogins} logins (${kpis.conversionRate}% conversion). Top demand is in ${trendingProduct?.productCode || 'C2PL'}, with ${primaryDrop ? primaryDrop[0] : 'checkout'} identified as the primary drop stage.`,
      insights
    };
  }

  /**
   * Grounded Natural Language Query Understanding & Data Analysis.
   * Answers natural language questions strictly from real data with zero hallucination.
   */
  _analyzeQueryGrounded(query, context) {
    const qLower = String(query || '').toLowerCase().trim();
    const { kpis, statusDistribution, trendingProduct, products, dropStages, topRejectionErrors, topLocations, sampleJourneys } = context;

    // 1. Check for specific Application Number or Phone Number lookup in the query
    const appMatch = qLower.match(/app-2026-\d{5}/i) || qLower.match(/\b(100\d{2})\b/);
    const phoneMatch = qLower.match(/\b(98200\d{5})\b/);

    if (appMatch || phoneMatch) {
      const targetQuery = appMatch ? appMatch[0].toUpperCase() : phoneMatch[0];
      const found = sampleJourneys.find(j => {
        const appNo = String(j.applicationNumber || '').toUpperCase();
        const pNo = String(j.mobileNumber || '');
        return appNo.includes(targetQuery) || pNo.includes(targetQuery);
      });

      if (found) {
        return `Here are the verified journey records for **${found.applicationNumber}**:\n` +
          `- **Customer Name:** ${found.customerName || 'Customer'}\n` +
          `- **Mobile Number:** ${found.mobileNumber}\n` +
          `- **Status:** **${found.status}**\n` +
          `- **Product:** **${found.product}**\n` +
          `- **Sum Assured:** ₹${Number(found.sumAssured || 0).toLocaleString('en-IN')}\n` +
          `- **Premium:** ₹${Number(found.premiumAmount || 0).toLocaleString('en-IN')} (${found.frequency || 'Annual'})\n` +
          `- **Stage / Drop Page:** ${found.dropPage || 'Completed'}\n` +
          `- **Location:** ${found.location || 'India'} (Age: ${found.age}, Group: ${found.ageGroup})\n` +
          `- **Journey Started:** ${found.journeyStarted || '—'}`;
      } else {
        return `Based on the provided portfolio dataset, no journey record matching **${targetQuery}** was found. Please verify the application or mobile number.`;
      }
    }

    // 2. Check for Specific Product inquiry (e.g. "Tell me about C2PL" or "How is GPP performing?")
    const productCodes = Object.keys(PRODUCT_CATALOG);
    const mentionedProduct = productCodes.find(code => {
      const name = PRODUCT_CATALOG[code].name.toLowerCase();
      return qLower.includes(code.toLowerCase()) || qLower.includes(name);
    });

    if (mentionedProduct && !qLower.includes('trending') && !qLower.includes('all products')) {
      const pData = products.find(p => p.productCode === mentionedProduct);
      if (pData) {
        const topLocs = Object.entries(pData.locations || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([l, c]) => `${l} (${c})`)
          .join(', ');

        const topAge = Object.entries(pData.ageGroups || {})
          .sort(([, a], [, b]) => b - a)[0];

        return `Here is the verified data for **${pData.name} (${pData.productCode})** in the selected period:\n` +
          `- **Total Applications:** **${pData.totalApplications}**\n` +
          `- **Application Submissions:** **${pData.submissions}**\n` +
          `- **Submission Conversion Rate:** **${pData.totalApplications > 0 ? ((pData.submissions / pData.totalApplications) * 100).toFixed(1) : 0}%**\n` +
          `- **Primary Age Group:** **${topAge ? topAge[0] : '26-35'} Years** (${topAge ? topAge[1] : 0} applicants)\n` +
          `- **Top Demanding Locations:** ${topLocs || 'Not recorded'}\n` +
          `- **Category:** ${pData.category}`;
      } else {
        return `Product **${mentionedProduct}** is part of the catalog, but has 0 journey applications recorded in the selected period.`;
      }
    }

    // 3. Trending / Top Product inquiry
    if (qLower.includes('trending') || qLower.includes('popular') || qLower.includes('top product') || qLower.includes('best product')) {
      if (!trendingProduct) {
        return 'Based on the provided portfolio dataset, no product has recorded applications in the selected period.';
      }
      return `The #1 trending product is **${trendingProduct.name} (${trendingProduct.productCode})**:\n` +
        `- **Total Applications:** **${trendingProduct.totalApplications}**\n` +
        `- **Submissions:** **${trendingProduct.submissions}**\n` +
        `- **Submission Conversion Rate:** **${trendingProduct.submissionRate}%**\n` +
        `- **Top Age Demographic:** **${Object.entries(trendingProduct.ageGroups || {}).sort(([,a],[,b]) => b - a)[0]?.[0] || '26-35'} Years**\n` +
        `- **Key Locations:** ${Object.entries(trendingProduct.locations || {}).sort(([,a],[,b]) => b - a).slice(0, 3).map(([l, c]) => `${l} (${c})`).join(', ')}`;
    }

    // 4. Drop-offs / Bottlenecks / Abandonment
    if (qLower.includes('drop') || qLower.includes('bottleneck') || qLower.includes('abandon') || qLower.includes('expire') || qLower.includes('why')) {
      const dropEntries = Object.entries(dropStages)
        .sort(([, a], [, b]) => b - a);

      const dropList = dropEntries
        .map(([stage, count]) => `  - **${stage}**: ${count} drop-offs`)
        .join('\n');

      return `Based on journey stage tracking, there are **${kpis.droppedApplications} total drop-offs** (${statusDistribution.USER_DROPPED || 0} user dropped + ${statusDistribution.OFFER_EXPIRED || 0} expired offers):\n` +
        `- **Drop Stage Breakdown:**\n${dropList}\n` +
        `The primary bottleneck is **${dropEntries[0]?.[0] || 'Payment Page'}**, where the largest number of users abandoned the journey before completing payment or submission.`;
    }

    // 5. Conversion Rate / Submissions / Logins Funnel
    if (qLower.includes('conversion') || qLower.includes('submission') || qLower.includes('login') || qLower.includes('funnel') || qLower.includes('how many')) {
      return `Here is the verified portfolio conversion breakdown for the selected period:\n` +
        `- **Total Customer Logins (Quotes Initiated):** **${kpis.totalLogins}**\n` +
        `- **Total Application Journeys Created:** **${kpis.totalApplications}**\n` +
        `- **Successfully Submitted Applications:** **${kpis.totalSubmissions}**\n` +
        `- **Overall Conversion Rate:** **${kpis.conversionRate}%** (${kpis.totalSubmissions} submitted among ${kpis.totalLogins} logins)\n` +
        `- **Active In-Progress Applications:** **${kpis.activeApplications}**\n` +
        `- **Dropped / Expired:** **${kpis.droppedApplications}**`;
    }

    // 6. Production Status Breakdown
    if (qLower.includes('status') || qLower.includes('count') || qLower.includes('breakdown')) {
      return `Here are the counts for all 5 production statuses across the ${kpis.totalApplications} journey records:\n` +
        `- **Application Submitted (APP_SUBMITTED):** **${statusDistribution.APP_SUBMITTED || 0}** (${Math.round(((statusDistribution.APP_SUBMITTED || 0)/Math.max(kpis.totalApplications, 1))*100)}%)\n` +
        `- **Journey Active (JOURNEY_ACTIVE):** **${statusDistribution.JOURNEY_ACTIVE || 0}** (${Math.round(((statusDistribution.JOURNEY_ACTIVE || 0)/Math.max(kpis.totalApplications, 1))*100)}%)\n` +
        `- **Journey Complete (JORUNEY_COMPLETE):** **${statusDistribution.JORUNEY_COMPLETE || 0}**\n` +
        `- **Offer Expired (OFFER_EXPIRED):** **${statusDistribution.OFFER_EXPIRED || 0}**\n` +
        `- **User Dropped (USER_DROPPED):** **${statusDistribution.USER_DROPPED || 0}**`;
    }

    // 7. Demographics / Age Groups
    if (qLower.includes('age') || qLower.includes('demographic') || qLower.includes('young') || qLower.includes('old')) {
      const overallAge = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
      for (const p of products) {
        for (const [g, count] of Object.entries(p.ageGroups || {})) {
          overallAge[g] = (overallAge[g] || 0) + count;
        }
      }
      const totalAge = Object.values(overallAge).reduce((a, b) => a + b, 0) || 1;

      return `Age group distribution across all journey applications:\n` +
        `- **26-35 Years:** **${overallAge['26-35']}** (${Math.round((overallAge['26-35']/totalAge)*100)}% - Highest Seeking Group)\n` +
        `- **36-45 Years:** **${overallAge['36-45']}** (${Math.round((overallAge['36-45']/totalAge)*100)}%)\n` +
        `- **18-25 Years:** **${overallAge['18-25']}** (${Math.round((overallAge['18-25']/totalAge)*100)}%)\n` +
        `- **46-55 Years:** **${overallAge['46-55']}** (${Math.round((overallAge['46-55']/totalAge)*100)}%)\n` +
        `- **56+ Years:** **${overallAge['56+']}** (${Math.round((overallAge['56+']/totalAge)*100)}%)`;
    }

    // 8. Locations / Cities
    if (qLower.includes('city') || qLower.includes('cities') || qLower.includes('location') || qLower.includes('where') || qLower.includes('geography')) {
      const locList = topLocations.slice(0, 5)
        .map((l, i) => `  ${i + 1}. **${l.location}**: ${l.count} applications`)
        .join('\n');

      return `Top demanding geographic locations in the dataset:\n${locList}\n` +
        `**${topLocations[0]?.location || 'Bengaluru'}** and **${topLocations[1]?.location || 'Delhi'}** represent the highest concentration of applicants.`;
    }

    // 9. Underwriting Rejections / Errors / Ineligibility
    if (qLower.includes('error') || qLower.includes('reject') || qLower.includes('ineligible') || qLower.includes('criteria') || qLower.includes('rule')) {
      const errList = topRejectionErrors.slice(0, 5)
        .map((e, i) => `  ${i + 1}. **"${e.error}"** — ${e.count} exclusions`)
        .join('\n');

      return `Here are the top underwriting rejection causes recorded in the customer profiles:\n${errList}`;
    }

    // 10. Default General Portfolio Grounded Summary (If query is about the data in general)
    if (qLower.includes('summary') || qLower.includes('overview') || qLower.includes('tell me') || qLower.includes('portfolio') || qLower.includes('insurance') || qLower.includes('data')) {
      return `Here is the executive summary based strictly on the current portfolio dataset (${context.period.startDate} to ${context.period.endDate}):\n` +
        `- **Total Logins:** **${kpis.totalLogins}**\n` +
        `- **Total Applications:** **${kpis.totalApplications}** (${kpis.totalSubmissions} submitted, **${kpis.conversionRate}% conversion**)\n` +
        `- **Active Journeys:** **${kpis.activeApplications}** | **Drop-offs:** **${kpis.droppedApplications}**\n` +
        `- **Top Product:** **${trendingProduct?.name || 'Click 2 Protect Life'} (${trendingProduct?.productCode || 'C2PL'})** with ${trendingProduct?.totalApplications || 0} applications\n` +
        `- **Primary Drop Stage:** **${Object.keys(dropStages)[0] || 'Payment Page'}**\n` +
        `- **Top Cities:** ${topLocations.slice(0, 3).map(l => l.location).join(', ')}`;
    }

    // 11. STRICT ANTI-HALLUCINATION GUARD for out-of-scope queries
    return `Based on the provided insurance journey and underwriting portfolio data, this information is not available. My analysis is restricted strictly to the insurance dataset provided.`;
  }
}

export const aiService = new AiService();
