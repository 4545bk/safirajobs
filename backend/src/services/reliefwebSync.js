const axios = require('axios');
const Job = require('../models/Job');
const { clearCache } = require('../middleware/cache');
const logger = require('../utils/logger');
const { notifyNewJobs } = require('./pushService');

// ReliefWeb API configuration
const RELIEFWEB_API_URL = 'https://api.reliefweb.int/v2/jobs';
const APP_NAME = process.env.RELIEFWEB_APPNAME || 'safirajobs';

// Retry configuration
const RETRY_CONFIG = {
    maxAttempts: 5,
    baseDelayMs: 1000,  // 1 second
    maxDelayMs: 30000,  // 30 seconds max
};

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getBackoffDelay = (attempt) => {
    const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
    // Add jitter (10-20% randomness) to prevent thundering herd
    const jitter = delay * (0.1 + Math.random() * 0.1);
    return Math.min(delay + jitter, RETRY_CONFIG.maxDelayMs);
};

/**
 * Map ReliefWeb experience values to our simplified levels
 */
const mapExperienceLevel = (experience) => {
    if (!experience || experience.length === 0) return 'Unknown';

    const exp = experience[0].name?.toLowerCase() || '';

    if (exp.includes('0') || exp.includes('1') || exp.includes('2') || exp.includes('entry')) {
        return 'Entry';
    }
    if (exp.includes('3') || exp.includes('4') || exp.includes('5') || exp.includes('mid')) {
        return 'Mid';
    }
    if (exp.includes('senior') || exp.includes('10') || exp.includes('15') || exp.includes('executive')) {
        return 'Senior';
    }

    return 'Mid';
};

/**
 * Extract the first category name
 */
const mapCategory = (careerCategories) => {
    if (!careerCategories || careerCategories.length === 0) return 'General';
    return careerCategories[0].name || 'General';
};

/**
 * Extract location from city or default to Ethiopia
 */
const mapLocation = (cities) => {
    if (!cities || cities.length === 0) return 'Ethiopia';
    return cities.map(c => c.name).join(', ') || 'Ethiopia';
};

/**
 * Transform ReliefWeb job data to our schema
 */
const transformJob = (rwJob) => {
    const fields = rwJob.fields;

    return {
        sourceId: rwJob.id.toString(),
        title: fields.title || 'Untitled Position',
        organization: fields.source?.[0]?.name || 'Unknown Organization',
        location: mapLocation(fields.city),
        country: 'Ethiopia',
        category: mapCategory(fields.career_categories),
        experienceLevel: mapExperienceLevel(fields.experience),
        description: fields.body || '',
        applyUrl: fields.url || `https://reliefweb.int/job/${rwJob.id}`,
        postedDate: fields.date?.created ? new Date(fields.date.created) : new Date(),
        closingDate: fields.date?.closing ? new Date(fields.date.closing) : null
    };
};

/**
 * Fetch jobs from ReliefWeb API with retry logic
 */
const fetchReliefWebJobs = async (offset = 0, limit = 100) => {
    // ReliefWeb API requires POST with JSON body for filtered queries
    const response = await axios.post(RELIEFWEB_API_URL, {
        preset: 'latest',
        limit,
        offset,
        filter: {
            field: 'country.name',
            value: 'Ethiopia'
        },
        fields: {
            include: [
                'id', 'title', 'body', 'url',
                'source.name', 'country.name',
                'city.name', 'career_categories.name',
                'experience.name', 'date.created',
                'date.closing'
            ]
        }
    }, {
        params: {
            appname: APP_NAME
        },
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SafiraJobs/1.0 (https://safirajobs.com; contact@safirajobs.com)',
            'Accept': 'application/json'
        },
        timeout: 30000,
    });

    return response.data;
};

/**
 * Fetch all jobs with retry logic and exponential backoff
 */
const fetchAllJobsWithRetry = async () => {
    const allJobs = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore && offset < 500) {
        let lastError = null;
        let success = false;

        // Retry loop for each page
        for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = getBackoffDelay(attempt - 1);
                    logger.warn(`Retry attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts} after ${Math.round(delay)}ms`, {
                        offset,
                        previousError: lastError?.message
                    });
                    await sleep(delay);
                }

                const data = await fetchReliefWebJobs(offset, limit);
                const jobs = data.data || [];

                allJobs.push(...jobs);
                totalFetched += jobs.length;
                hasMore = jobs.length === limit;
                success = true;
                break; // Success, exit retry loop

            } catch (error) {
                lastError = error;
                logger.error(`Fetch attempt ${attempt + 1} failed`, error, { offset });

                // Don't retry on 4xx errors (client errors)
                if (error.response?.status >= 400 && error.response?.status < 500) {
                    throw new Error(`ReliefWeb API error: ${error.response.status} - ${error.message}`);
                }
            }
        }

        if (!success) {
            throw new Error(`Failed to fetch jobs after ${RETRY_CONFIG.maxAttempts} attempts: ${lastError?.message}`);
        }

        offset += limit;

        // Small delay between successful requests to be nice to the API
        if (hasMore) {
            await sleep(500);
        }
    }

    return { jobs: allJobs, totalFetched };
};

/**
 * Sync jobs from ReliefWeb to MongoDB
 * Returns structured result with success/error status
 */
const syncJobs = async () => {
    logger.info('Starting job sync from ReliefWeb');
    const startTime = Date.now();

    const stats = {
        fetched: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        errors: 0,
        success: true,
        errorMessage: null
    };

    try {
        // Fetch all jobs with retry
        const { jobs: allJobs, totalFetched } = await fetchAllJobsWithRetry();
        stats.fetched = totalFetched;

        logger.info(`Fetched ${stats.fetched} jobs from ReliefWeb`);

        // Process each job
        const createdJobs = []; // Track newly created jobs for push notifications
        for (const rwJob of allJobs) {
            try {
                const jobData = transformJob(rwJob);

                const result = await Job.findOneAndUpdate(
                    { sourceId: jobData.sourceId },
                    jobData,
                    { upsert: true, new: true, runValidators: true }
                );

                if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                    stats.created++;
                    createdJobs.push(result); // Save for push notification
                } else {
                    stats.updated++;
                }
            } catch (error) {
                logger.error(`Error processing job ${rwJob.id}`, error);
                stats.errors++;
            }
        }

        // Delete expired jobs (closing date has passed)
        const deleteResult = await Job.deleteMany({
            closingDate: { $lt: new Date() }
        });
        stats.deleted = deleteResult.deletedCount;

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Sync completed in ${duration}s`, { stats });

        // Clear cache to serve fresh data
        clearCache();

        // Send push notifications for new jobs
        if (createdJobs.length > 0) {
            try {
                await notifyNewJobs(createdJobs);
            } catch (pushError) {
                logger.error('Failed to send push notifications', pushError);
            }
        }

        return stats;

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        stats.success = false;
        stats.errorMessage = error.message;

        logger.error(`Sync failed after ${duration}s`, error, { stats });

        return stats;
    }
};

/**
 * Cleanup expired and stale jobs
 * - Expired: closingDate < now
 * - Stale: no closingDate and older than staleDays
 */
const cleanupJobs = async (staleDays = 30) => {
    logger.info('Starting job cleanup');
    const startTime = Date.now();

    const stats = {
        expired: 0,
        stale: 0,
        total: 0,
        success: true,
        errorMessage: null
    };

    try {
        const now = new Date();

        // Delete expired jobs
        const expiredResult = await Job.deleteMany({
            closingDate: { $lt: now }
        });
        stats.expired = expiredResult.deletedCount;

        // Delete stale jobs (no closing date, older than staleDays)
        const staleDate = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000);
        const staleResult = await Job.deleteMany({
            closingDate: null,
            createdAt: { $lt: staleDate }
        });
        stats.stale = staleResult.deletedCount;

        stats.total = stats.expired + stats.stale;

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Cleanup completed in ${duration}s`, { stats });

        // Clear cache if any jobs were deleted
        if (stats.total > 0) {
            clearCache();
        }

        return stats;

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        stats.success = false;
        stats.errorMessage = error.message;

        logger.error(`Cleanup failed after ${duration}s`, error, { stats });

        return stats;
    }
};

module.exports = {
    syncJobs,
    cleanupJobs,
    fetchReliefWebJobs
};
