/**
 * Offline storage service using AsyncStorage
 * Caches job list and individual job details for offline access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
    JOBS_LIST: '@safirajobs_jobs_list',
    JOB_DETAIL: '@safirajobs_job_',
    LAST_SYNC: '@safirajobs_last_sync',
    FILTERS: '@safirajobs_filters',
};

// Cache expiry (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Save jobs list to storage
 * @param {Object} data - { jobs, pagination }
 * @param {Object} filters - Current filter params
 */
export const saveJobs = async (data, filters = {}) => {
    try {
        const cacheKey = getCacheKey(filters);
        const cacheData = {
            data,
            timestamp: Date.now(),
            filters,
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
        await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
        console.warn('Failed to cache jobs:', error);
    }
};

/**
 * Get cached jobs list
 * @param {Object} filters - Filter params to match
 * @returns {Object|null} - { data, isStale, cachedAt } or null
 */
export const getJobs = async (filters = {}) => {
    try {
        const cacheKey = getCacheKey(filters);
        const cached = await AsyncStorage.getItem(cacheKey);

        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const isStale = Date.now() - timestamp > CACHE_TTL;

        return {
            data,
            isStale,
            cachedAt: new Date(timestamp).toISOString(),
        };
    } catch (error) {
        console.warn('Failed to get cached jobs:', error);
        return null;
    }
};

/**
 * Save job detail to storage
 * @param {Object} job - Job object with _id
 */
export const saveJobDetail = async (job) => {
    try {
        const cacheData = {
            data: job,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(
            KEYS.JOB_DETAIL + job._id,
            JSON.stringify(cacheData)
        );
    } catch (error) {
        console.warn('Failed to cache job detail:', error);
    }
};

/**
 * Get cached job detail
 * @param {string} id - Job ID
 * @returns {Object|null} - { data, isStale, cachedAt } or null
 */
export const getJobDetail = async (id) => {
    try {
        const cached = await AsyncStorage.getItem(KEYS.JOB_DETAIL + id);

        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const isStale = Date.now() - timestamp > CACHE_TTL;

        return {
            data,
            isStale,
            cachedAt: new Date(timestamp).toISOString(),
        };
    } catch (error) {
        console.warn('Failed to get cached job:', error);
        return null;
    }
};

/**
 * Get last sync time
 * @returns {string|null} - ISO timestamp or null
 */
export const getLastSync = async () => {
    try {
        return await AsyncStorage.getItem(KEYS.LAST_SYNC);
    } catch (error) {
        return null;
    }
};

/**
 * Clear all cached data
 */
export const clearCache = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const safirajobsKeys = keys.filter(k => k.startsWith('@safirajobs_'));
        await AsyncStorage.multiRemove(safirajobsKeys);
    } catch (error) {
        console.warn('Failed to clear cache:', error);
    }
};

/**
 * Generate cache key based on filters
 */
const getCacheKey = (filters) => {
    const normalized = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        location: filters.location || '',
        category: filters.category || '',
        experience: filters.experience || '',
        search: filters.search || '',
    };
    return KEYS.JOBS_LIST + '_' + Object.values(normalized).join('_');
};
