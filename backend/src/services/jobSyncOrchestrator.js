/**
 * Job Sync Orchestrator
 * Coordinates multiple job sources with staggered schedules and error handling
 */

const { syncJobs: syncReliefWeb } = require('./reliefwebSync');
const { syncEthioJobs } = require('./ethioJobsSync');
const { syncIndeedJobs } = require('./indeedSync');
const logger = require('../utils/logger');

// Track last sync times
const lastSync = {
    reliefweb: null,
    ethiojobs: null,
    indeed: null
};

/**
 * Sync all job sources with staggered schedules
 */
const syncAllSources = async () => {
    const results = {
        reliefweb: { skipped: true },
        ethiojobs: { skipped: true },
        indeed: { skipped: true },
        totalJobs: 0
    };

    const now = Date.now();

    try {
        // ReliefWeb: Every 5 minutes
        if (!lastSync.reliefweb || (now - lastSync.reliefweb) >= 5 * 60 * 1000) {
            logger.info('Syncing ReliefWeb...');
            results.reliefweb = await syncReliefWeb();
            lastSync.reliefweb = now;
        }

        // EthioJobs: Every 6 hours
        if (!lastSync.ethiojobs || (now - lastSync.ethiojobs) >= 6 * 60 * 60 * 1000) {
            logger.info('Syncing EthioJobs...');
            results.ethiojobs = await syncEthioJobs();
            lastSync.ethiojobs = now;
        }

        // Indeed: Every 4 hours
        if (!lastSync.indeed || (now - lastSync.indeed) >= 4 * 60 * 60 * 1000) {
            logger.info('Syncing Indeed...');
            results.indeed = await syncIndeedJobs();
            lastSync.indeed = now;
        }

        // Calculate total jobs
        const Job = require('../models/Job');
        results.totalJobs = await Job.countDocuments();

        logger.info('Orchestrator sync complete', {
            totalJobs: results.totalJobs,
            reliefweb: results.reliefweb.skipped ? 'skipped' : results.reliefweb.stats?.created || 0,
            ethiojobs: results.ethiojobs.skipped ? 'skipped' : results.ethiojobs.stats?.created || 0,
            indeed: results.indeed.skipped ? 'skipped' : results.indeed.stats?.created || 0
        });

        return results;

    } catch (error) {
        logger.error('Orchestrator sync failed:', error);
        return results;
    }
};

/**
 * Force sync a specific source
 */
const syncSource = async (sourceName) => {
    logger.info(`Force syncing ${sourceName}...`);

    switch (sourceName) {
        case 'reliefweb':
            lastSync.reliefweb = null;
            return await syncReliefWeb();
        case 'ethiojobs':
            lastSync.ethiojobs = null;
            return await syncEthioJobs();
        case 'indeed':
            lastSync.indeed = null;
            return await syncIndeedJobs();
        default:
            throw new Error(`Unknown source: ${sourceName}`);
    }
};

/**
 * Get sync status for all sources
 */
const getSyncStatus = async () => {
    const Job = require('../models/Job');
    const now = Date.now();

    const [totalJobs, reliefwebCount, ethiojobsCount, indeedCount] = await Promise.all([
        Job.countDocuments(),
        Job.countDocuments({ source: 'reliefweb' }),
        Job.countDocuments({ source: 'ethiojobs' }),
        Job.countDocuments({ source: 'indeed' })
    ]);

    return {
        total: totalJobs,
        sources: {
            reliefweb: {
                count: reliefwebCount,
                lastSync: lastSync.reliefweb,
                nextSync: lastSync.reliefweb ? new Date(lastSync.reliefweb + 5 * 60 * 1000) : 'pending',
                interval: '5 minutes'
            },
            ethiojobs: {
                count: ethiojobsCount,
                lastSync: lastSync.ethiojobs,
                nextSync: lastSync.ethiojobs ? new Date(lastSync.ethiojobs + 6 * 60 * 60 * 1000) : 'pending',
                interval: '6 hours'
            },
            indeed: {
                count: indeedCount,
                lastSync: lastSync.indeed,
                nextSync: lastSync.indeed ? new Date(lastSync.indeed + 4 * 60 * 60 * 1000) : 'pending',
                interval: '4 hours'
            }
        }
    };
};

module.exports = { syncAllSources, syncSource, getSyncStatus };
