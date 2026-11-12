/**
 * Secure, typed API client for communication with the Node.js backend.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error?.message || `HTTP error ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.code = errorBody?.error?.code;
      throw err;
    }
    return await res.json();
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const apiClient = {
  getHealth: () => request('/health'),
  
  getStats: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return request(`/stats${qs ? `?${qs}` : ''}`);
  },

  getProductAnalytics: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return request(`/products/analytics${qs ? `?${qs}` : ''}`);
  },

  lookup: (query, searchType) => {
    const params = new URLSearchParams();
    if (searchType) params.set('search_type', searchType);
    const qs = params.toString();
    const encoded = encodeURIComponent(String(query).trim());
    return request(`/customer/${encoded}${qs ? `?${qs}` : ''}`);
  },

  getAiInsights: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return request(`/ai/insights${qs ? `?${qs}` : ''}`);
  },

  askAi: (query, startDate, endDate) => {
    const payload = { query: String(query).trim() };
    if (startDate) payload.start_date = startDate;
    if (endDate) payload.end_date = endDate;
    return request('/ai/ask', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

