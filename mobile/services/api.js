/**
 * API service with offline fallback
 * Tries network first, falls back to cache when offline
 */

import * as storage from './storage';

// API URL Configuration:
// - Android Emulator: 10.0.2.2 (points to host's localhost)
// - Genymotion: 10.0.3.2
// - Physical device on same WiFi: use your computer's IP
// - Production: https://safirajobs-api.onrender.com/api
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Request timeout (10 seconds)
const TIMEOUT = 10000;

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Fetch jobs with optional filters
 * Returns { data, isOffline } - isOffline indicates cached data
 */
export const getJobs = async ({
    page = 1,
    limit = 20,
    location,
    category,
    experience,
    search
} = {}) => {
    const filters = { page, limit, location, category, experience, search };

    try {
        // Build query params
        const params = new URLSearchParams({ page, limit });
        if (location) params.append('location', location);
        if (category) params.append('category', category);
        if (experience) params.append('experience', experience);
        if (search) params.append('search', search);

        // Try network first
        const response = await fetchWithTimeout(`${API_BASE_URL}/jobs?${params}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // Cache successful response
        await storage.saveJobs(result.data, filters);

        return {
            ...result,
            isOffline: false,
        };

    } catch (error) {
        console.log('Network failed, trying cache:', error.message);

        // Fall back to cache
        const cached = await storage.getJobs(filters);

        if (cached) {
            return {
                success: true,
                data: cached.data,
                isOffline: true,
                cachedAt: cached.cachedAt,
                isStale: cached.isStale,
            };
        }

        // No cache available
        throw new Error('No internet connection and no cached data');
    }
};

/**
 * Fetch single job by ID
 * Returns { data, isOffline }
 */
export const getJobById = async (id) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/jobs/${id}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // Cache successful response
        if (result.success && result.data) {
            await storage.saveJobDetail(result.data);
        }

        return {
            ...result,
            isOffline: false,
        };

    } catch (error) {
        console.log('Network failed, trying cache:', error.message);

        // Fall back to cache
        const cached = await storage.getJobDetail(id);

        if (cached) {
            return {
                success: true,
                data: cached.data,
                isOffline: true,
                cachedAt: cached.cachedAt,
                isStale: cached.isStale,
            };
        }

        throw new Error('No internet connection and no cached data');
    }
};

/**
 * Health check (no caching)
 */
export const checkHealth = async () => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
};

/**
 * Get last sync time
 */
export const getLastSyncTime = async () => {
    return await storage.getLastSync();
};

/**
 * Clear all cached data
 */
export const clearOfflineData = async () => {
    return await storage.clearCache();
};
