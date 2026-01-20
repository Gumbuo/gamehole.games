// Mock KV store for local development when Vercel KV isn't configured
// This stores data in memory - it will be lost on server restart

const mockStore = new Map<string, unknown>();

// Define the KV interface matching Vercel KV methods
export interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  zrange(key: string, start: number, end: number): Promise<string[]>;
  zadd(key: string, score: number, member: string): Promise<number>;
}

export const mockKV: KVStore = {
  async get<T>(key: string): Promise<T | null> {
    const value = mockStore.get(key);
    return (value as T) ?? null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    mockStore.set(key, value);
  },

  async del(key: string): Promise<void> {
    mockStore.delete(key);
  },

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(mockStore.keys()).filter(k => regex.test(k));
  },

  async zrange(key: string, start: number, end: number): Promise<string[]> {
    const value = mockStore.get(key) as Array<{score: number, member: string}> || [];
    const sorted = [...value].sort((a, b) => a.score - b.score);
    const slice = start >= 0 ? sorted.slice(start, end + 1) : sorted.slice(start);
    return slice.map(item => item.member);
  },

  async zadd(key: string, score: number, member: string): Promise<number> {
    const value = mockStore.get(key) as Array<{score: number, member: string}> || [];
    const existing = value.findIndex(item => item.member === member);
    if (existing >= 0) {
      value[existing].score = score;
    } else {
      value.push({ score, member });
    }
    mockStore.set(key, value);
    return existing >= 0 ? 0 : 1;
  }
};

// Export a unified interface
export function getKV(): KVStore {
  const isKVAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (isKVAvailable) {
    // Use real Vercel KV
    const { kv } = require('@vercel/kv');
    return kv as KVStore;
  }

  // Use mock store for development
  console.log('[DEV] Using mock KV store - data will not persist');
  return mockKV;
}
