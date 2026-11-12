import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { ENV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');

class InMemoryCollection {
  constructor(name, data) {
    this.name = name;
    this.data = JSON.parse(JSON.stringify(data || []));
  }

  find(filter = {}) {
    let result = this.data.filter(item => this._matches(item, filter));
    return {
      toArray: async () => result,
      sort: (sortObj) => {
        const [field, dir] = Object.entries(sortObj)[0] || [];
        if (field) {
          result.sort((a, b) => {
            const va = a[field] ?? '';
            const vb = b[field] ?? '';
            return dir === -1 ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
          });
        }
        return {
          toArray: async () => result,
          limit: (n) => ({ toArray: async () => result.slice(0, n) })
        };
      },
      limit: (n) => ({ toArray: async () => result.slice(0, n) })
    };
  }

  async countDocuments(filter = {}) {
    return this.data.filter(item => this._matches(item, filter)).length;
  }

  _matches(item, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, val] of Object.entries(filter)) {
      if (val && typeof val === 'object' && val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(String(item[key] || ''))) return false;
      } else if (item[key] !== val) {
        return false;
      }
    }
    return true;
  }
}

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isLive = false;
    this.embeddedCollections = new Map();
  }

  async initialize() {
    // 1. Preload JSON data files into memory fallback
    this._loadEmbeddedData();

    // 2. Attempt live MongoDB connection with short timeout
    try {
      this.client = new MongoClient(ENV.MONGO_URI, {
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 1500
      });
      await this.client.connect();
      this.db = this.client.db(ENV.DB_NAME);
      this.isLive = true;
      console.log(`[Database] Connected to live MongoDB: ${ENV.MONGO_URI}/${ENV.DB_NAME}`);
      await this._seedLiveDbIfEmpty();
    } catch (err) {
      this.isLive = false;
      console.log(`[Database] Live MongoDB unavailable (${err.message}). Running in Resilient In-Memory Mode with preloaded collections.`);
    }
  }

  _loadEmbeddedData() {
    try {
      const omPath = path.join(ROOT_DIR, 'raw_data/openmarketjourneys.json');
      const jourPath = path.join(ROOT_DIR, 'raw_data/journeys.json');

      const omData = fs.existsSync(omPath) ? JSON.parse(fs.readFileSync(omPath, 'utf8')) : [];
      const jourData = fs.existsSync(jourPath) ? JSON.parse(fs.readFileSync(jourPath, 'utf8')) : [];

      this.embeddedCollections.set('openmarketjourneys', new InMemoryCollection('openmarketjourneys', omData));
      this.embeddedCollections.set('journeys', new InMemoryCollection('journeys', jourData));
      console.log(`[Database] Loaded embedded collections: openmarketjourneys (${omData.length} records), journeys (${jourData.length} records)`);
    } catch (err) {
      console.error('[Database] Failed to load raw JSON data:', err.message);
    }
  }

  async _seedLiveDbIfEmpty() {
    if (!this.isLive || !this.db) return;
    try {
      const omCol = this.db.collection('openmarketjourneys');
      const jourCol = this.db.collection('journeys');
      const omCount = await omCol.countDocuments();
      const jourCount = await jourCol.countDocuments();

      if (omCount === 0) {
        const omData = this.embeddedCollections.get('openmarketjourneys')?.data || [];
        if (omData.length > 0) await omCol.insertMany(omData);
      }
      if (jourCount === 0) {
        const jourData = this.embeddedCollections.get('journeys')?.data || [];
        if (jourData.length > 0) await jourCol.insertMany(jourData);
      }
    } catch (e) {
      console.warn('[Database] Seed check warning:', e.message);
    }
  }

  getCollection(name) {
    if (this.isLive && this.db) {
      return this.db.collection(name);
    }
    return this.embeddedCollections.get(name);
  }

  getStatus() {
    return {
      connected: this.isLive,
      mode: this.isLive ? 'Live MongoDB' : 'Resilient In-Memory Store',
      openmarketCount: this.embeddedCollections.get('openmarketjourneys')?.data.length || 0,
      journeysCount: this.embeddedCollections.get('journeys')?.data.length || 0
    };
  }
}

export const dbManager = new DatabaseManager();

