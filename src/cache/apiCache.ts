import { ResponseData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { fetchTesouroDiretoAPI } from '../api/tesouroDireto.js';

interface CacheEntry {
  data: ResponseData;
  timestamp: string; // ISO string of when cached
  bizTimestamp: string; // dtTm from BizSts
}

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION_MS = 10 * 60 * 1000;

let cachedData: CacheEntry | null = null;

/**
 * Checks if the cached data is valid based on the BizSts timestamp
 */
export function isCacheValid(): boolean {
  if (!cachedData) return false;

  const now = new Date();
  const cachedTime = new Date(cachedData.timestamp);
  const cacheAge = now.getTime() - cachedTime.getTime();

  // Check if cache is less than 10 minutes old
  return cacheAge < CACHE_DURATION_MS;
}

/**
 * Gets data from cache if valid, otherwise returns null
 */
export function getFromCache(): ResponseData | null {
  if (isCacheValid()) {
    logger.info('Returning data from cache, age: ' +
      ((new Date().getTime() - new Date(cachedData!.timestamp).getTime()) / 1000) + ' seconds');
    return cachedData!.data;
  }

  logger.info('Cache invalid or expired');
  return null;
}

/**
 * Stores API response in cache
 */
export function storeInCache(data: ResponseData): void {
  cachedData = {
    data,
    timestamp: new Date().toISOString(),
    bizTimestamp: data.BizSts.dtTm
  };

  logger.info(`Data cached with BizSts timestamp: ${data.BizSts.dtTm}`);
}

/**
 * Checks if the new data has a different BizSts timestamp than the cached data
 * Used to determine if we should update the cache
 */
export function hasNewData(newData: ResponseData): boolean {
  if (!cachedData) return true;

  return cachedData.bizTimestamp !== newData.BizSts.dtTm;
}

/**
 * Clears the cache
 */
export function clearCache(): void {
  cachedData = null;
  logger.info('Cache cleared');
}

/**
 * Gets API data with caching logic
 * Attempts to get data from cache first, falls back to API if needed
 */
export async function getApiDataWithCache(context: string = 'API request'): Promise<ResponseData> {
  // Try to get data from cache first
  let responseData = getFromCache();

  // If nothing in cache, fetch from API
  if (!responseData) {
    logger.info(`Fetching fresh data for ${context}`);
    responseData = await fetchTesouroDiretoAPI();

    // Store in cache if it's new data
    if (hasNewData(responseData)) {
      storeInCache(responseData);
    }
  }

  return responseData;
}
