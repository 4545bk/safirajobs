/**
 * Ethio Job API Sync Service
 * Fetches Ethiopian job listings from Chaos-19's ethio-job-api
 * https://github.com/Chaos-19/ethio-job-api
 */

const axios = require('axios');

// API Configuration
const ETHIO_JOB_API = {
    baseUrl: process.env.ETHIO_JOB_API_URL || 'https://ethio-job-api.onrender.com',
    apiKey: process.env.ETHIO_JOB_API_KEY || '$2b$10$nmoPHzeiiBfB8i828GQQ/.Fk1Joiutok01.yFRxYIGQZidpGvamge',
    enabled: true,
};

const logger = {
    info: (msg, data) => console.log(`[EthioJobAPI] ${msg}`, data || ''),
    error: (msg, err) => console.error(`[EthioJobAPI] ${msg}`, err?.message || err || ''),
    warn: (msg, data) => console.warn(`[EthioJobAPI] ${msg}`, data || ''),
};

/**
 * Map category from Ethio Job API to our standard categories
 */
const mapCategory = (category) => {
    if (!category) return 'General';
    const cat = category.toLowerCase();

    if (cat.includes('tech') || cat.includes('software') || cat.includes('it') || cat.includes('developer')) return 'IT';
    if (cat.includes('finance') || cat.includes('account') || cat.includes('bank')) return 'Finance';
    if (cat.includes('health') || cat.includes('medical') || cat.includes('nurse')) return 'Health';
    if (cat.includes('marketing') || cat.includes('sales')) return 'Marketing';
    if (cat.includes('education') || cat.includes('teacher') || cat.includes('training')) return 'Education';
    if (cat.includes('engineering') || cat.includes('construction')) return 'Construction';
    if (cat.includes('logistics') || cat.includes('driver') || cat.includes('transport')) return 'Logistics';
    if (cat.includes('admin') || cat.includes('secretary') || cat.includes('hr')) return 'Admin';

    return 'General';
};

/**
 * Fetch jobs from Ethio Job API
 */
const fetchEthioJobApiJobs = async () => {
    if (!ETHIO_JOB_API.enabled) {
        logger.info('Ethio Job API is disabled');
        return [];
    }

    try {
        logger.info('Fetching jobs from Ethio Job API...');

        const response = await axios.get(`${ETHIO_JOB_API.baseUrl}/jobs`, {
            headers: {
                'x-api-key': ETHIO_JOB_API.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });

        const data = response.data;
        const jobs = data.jobs || data.data || data || [];

        if (!Array.isArray(jobs)) {
            logger.warn('Unexpected response format', { type: typeof jobs });
            return [];
        }

        logger.info(`Found ${jobs.length} jobs from Ethio Job API`);

        // Transform jobs to our schema
        const transformedJobs = jobs.map((job, index) => ({
            externalId: `ethio-api-${job.id || index}-${Date.now()}`,
            title: job.title || 'Untitled Position',
            organization: job.company || job.organization || 'Ethiopian Company',
            location: job.location || 'Addis Ababa, Ethiopia',
            category: mapCategory(job.category || job.title),
            description: job.description || `${job.title} position at ${job.company}`,
            requirements: job.requirements || job.qualifications || '',
            salary: job.salary || 'Negotiable',
            type: job.type || job.employment_type || 'full-time',
            experienceLevel: job.experience || 'mid',
            deadline: job.deadline || job.closing_date || null,
            postedDate: job.posted_date ? new Date(job.posted_date) : new Date(),
            applyUrl: job.apply_url || job.url || job.link || '',
            source: 'ethio-job-api',
            isExternal: true,
            skills: job.skills || [],
            benefits: job.benefits || [],
        }));

        // Filter out jobs with missing essential fields
        const validJobs = transformedJobs.filter(job =>
            job.title && job.title !== 'Untitled Position'
        );

        logger.info(`Transformed ${validJobs.length} valid jobs from Ethio Job API`);
        return validJobs;

    } catch (error) {
        if (error.response) {
            logger.error(`API responded with status ${error.response.status}`, error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            logger.error('Request timed out');
        } else {
            logger.error('Failed to fetch from Ethio Job API', error);
        }
        return []; // Return empty array on error - don't break other sources
    }
};

/**
 * Test the API connection
 */
const testConnection = async () => {
    try {
        const response = await axios.get(`${ETHIO_JOB_API.baseUrl}/jobs`, {
            headers: {
                'x-api-key': ETHIO_JOB_API.apiKey,
            },
            timeout: 10000,
        });
        return { success: true, count: response.data?.jobs?.length || 0 };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    fetchEthioJobApiJobs,
    testConnection,
    ETHIO_JOB_API,
};
