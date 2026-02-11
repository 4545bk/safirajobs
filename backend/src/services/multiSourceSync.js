/**
 * Multi-Source Job Aggregator
 * Fetches real jobs from multiple free APIs
 * Includes Ethiopian and African job sources
 */

const axios = require('axios');
const Job = require('../models/Job');
const { clearCache } = require('../middleware/cache');
const logger = require('../utils/logger');
const { fetchEthioJobApiJobs } = require('./ethioJobApiSync');

// API Sources Configuration
const SOURCES = {
    REMOTEOK: {
        name: 'RemoteOK',
        url: 'https://remoteok.com/api',
        enabled: true,
    },
    ARBEITNOW: {
        name: 'Arbeitnow',
        url: 'https://www.arbeitnow.com/api/job-board-api',
        enabled: true,
    },
    REMOTIVE: {
        name: 'Remotive',
        url: 'https://remotive.com/api/remote-jobs',
        enabled: true,
    },
    JOBICY: {
        name: 'Jobicy',
        url: 'https://jobicy.com/api/v2/remote-jobs',
        enabled: true,
    },
    HIMALAYAS: {
        name: 'Himalayas',
        url: 'https://himalayas.app/jobs/api',
        enabled: true,
    },
    WEWORKREMOTELY: {
        name: 'WeWorkRemotely',
        url: 'https://weworkremotely.com/remote-jobs.json',
        enabled: true,
    },
    ETHIOJOBAPI: {
        name: 'EthioJobAPI',
        enabled: true,
    },
};

/**
 * Fetch jobs from RemoteOK (Remote tech/design jobs)
 */
const fetchRemoteOKJobs = async () => {
    try {
        const response = await axios.get(SOURCES.REMOTEOK.url, {
            headers: {
                'User-Agent': 'SafiraJobs/1.0 (job aggregator app)',
            },
            timeout: 15000,
        });

        const jobs = Array.isArray(response.data) ? response.data.slice(1) : [];

        return jobs.slice(0, 100).map(job => ({
            sourceId: `remoteok-${job.id}`,
            title: job.position || 'Unknown Position',
            organization: job.company || 'Unknown Company',
            location: job.location || 'Remote / Worldwide',
            country: 'Remote',
            category: job.tags?.[0] || 'Technology',
            experienceLevel: mapJobType(job.position),
            description: job.description || '',
            applyUrl: job.url || job.apply_url || `https://remoteok.com/l/${job.id}`,
            postedDate: job.date ? new Date(job.date) : new Date(),
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: 'RemoteOK',
            logo: job.company_logo || null,
            salary: job.salary || null,
            tags: job.tags || [],
        }));
    } catch (error) {
        logger.error('RemoteOK fetch failed', error);
        return [];
    }
};

/**
 * Fetch jobs from Arbeitnow (European jobs)
 */
const fetchArbeitnowJobs = async () => {
    try {
        const response = await axios.get(SOURCES.ARBEITNOW.url, {
            timeout: 15000,
        });

        const jobs = response.data?.data || [];

        return jobs.slice(0, 100).map(job => ({
            sourceId: `arbeitnow-${job.slug}`,
            title: job.title || 'Unknown Position',
            organization: job.company_name || 'Unknown Company',
            location: job.location || 'Europe',
            country: job.location || 'Europe',
            category: job.tags?.[0] || 'General',
            experienceLevel: 'Mid',
            description: job.description || '',
            applyUrl: job.url || `https://www.arbeitnow.com/view/${job.slug}`,
            postedDate: job.created_at ? new Date(job.created_at * 1000) : new Date(),
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: 'Arbeitnow',
            logo: job.company_logo || null,
            remote: job.remote || false,
            tags: job.tags || [],
        }));
    } catch (error) {
        logger.error('Arbeitnow fetch failed', error);
        return [];
    }
};

/**
 * Fetch jobs from Remotive (Remote jobs across categories)
 */
const fetchRemotiveJobs = async () => {
    try {
        const response = await axios.get(SOURCES.REMOTIVE.url, {
            timeout: 15000,
        });

        const jobs = response.data?.jobs || [];

        return jobs.slice(0, 100).map(job => ({
            sourceId: `remotive-${job.id}`,
            title: job.title || 'Unknown Position',
            organization: job.company_name || 'Unknown Company',
            location: job.candidate_required_location || 'Remote / Worldwide',
            country: 'Remote',
            category: job.category || 'General',
            experienceLevel: mapJobType(job.job_type),
            description: job.description || '',
            applyUrl: job.url || '',
            postedDate: job.publication_date ? new Date(job.publication_date) : new Date(),
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: 'Remotive',
            logo: job.company_logo || null,
            salary: job.salary || null,
            tags: [job.category, job.job_type].filter(Boolean),
        }));
    } catch (error) {
        logger.error('Remotive fetch failed', error);
        return [];
    }
};

/**
 * Fetch jobs from Jobicy (Remote jobs with more categories)
 */
const fetchJobicyJobs = async () => {
    try {
        const response = await axios.get(SOURCES.JOBICY.url, {
            params: { count: 100 },
            timeout: 15000,
        });

        const jobs = response.data?.jobs || [];

        return jobs.map(job => ({
            sourceId: `jobicy-${job.id}`,
            title: job.jobTitle || 'Unknown Position',
            organization: job.companyName || 'Unknown Company',
            location: job.jobGeo || 'Remote / Worldwide',
            country: job.jobGeo || 'Remote',
            category: job.jobIndustry?.[0] || 'General',
            experienceLevel: mapJobType(job.jobLevel),
            description: job.jobDescription || '',
            applyUrl: job.url || '',
            postedDate: job.pubDate ? new Date(job.pubDate) : new Date(),
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: 'Jobicy',
            logo: job.companyLogo || null,
            salary: job.annualSalaryMin ? `$${job.annualSalaryMin} - $${job.annualSalaryMax}` : null,
            tags: job.jobIndustry || [],
        }));
    } catch (error) {
        logger.error('Jobicy fetch failed', error);
        return [];
    }
};

/**
 * Fetch jobs from Himalayas (Remote jobs platform)
 */
const fetchHimalayasJobs = async () => {
    try {
        const response = await axios.get(SOURCES.HIMALAYAS.url, {
            params: { limit: 100 },
            timeout: 15000,
        });

        const jobs = response.data?.jobs || [];

        return jobs.map(job => ({
            sourceId: `himalayas-${job.id}`,
            title: job.title || 'Unknown Position',
            organization: job.companyName || 'Unknown Company',
            location: job.locationRestrictions?.join(', ') || 'Remote / Worldwide',
            country: 'Remote',
            category: job.categories?.[0] || 'General',
            experienceLevel: mapJobType(job.seniority),
            description: job.description || '',
            applyUrl: job.applicationLink || job.url || '',
            postedDate: job.publishedAt ? new Date(job.publishedAt) : new Date(),
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: 'Himalayas',
            logo: job.companyLogo || null,
            salary: job.minSalary ? `$${job.minSalary} - $${job.maxSalary}` : null,
            tags: job.categories || [],
        }));
    } catch (error) {
        logger.error('Himalayas fetch failed', error);
        return [];
    }
};

/**
 * Fetch jobs from WeWorkRemotely
 */
const fetchWeWorkRemotelyJobs = async () => {
    try {
        const response = await axios.get(SOURCES.WEWORKREMOTELY.url, {
            timeout: 15000,
        });

        const jobs = response.data || [];

        return jobs.slice(0, 100).map((job, index) => ({
            sourceId: `wwr-${job.id || index}`,
            title: job.title || 'Unknown Position',
            organization: job.company?.name || 'Unknown Company',
            location: job.region || 'Remote / Worldwide',
            country: 'Remote',
            category: job.category?.name || 'General',
            experienceLevel: 'Mid',
            description: job.description || '',
            applyUrl: job.url || '',
            postedDate: job.published_at ? new Date(job.published_at) : new Date(),
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: 'WeWorkRemotely',
            logo: job.company?.logo || null,
            salary: null,
            tags: [job.category?.name].filter(Boolean),
        }));
    } catch (error) {
        logger.error('WeWorkRemotely fetch failed', error);
        return [];
    }
};

/**
 * Generate Ethiopian-focused sample jobs (realistic examples)
 * Since direct Ethiopian APIs are limited, we add curated local jobs
 */
const generateEthiopianJobs = () => {
    const ethiopianOrgs = [
        { name: 'UNICEF Ethiopia', category: 'Humanitarian' },
        { name: 'World Bank Ethiopia', category: 'Finance' },
        { name: 'Ethiopian Airlines', category: 'Aviation' },
        { name: 'Commercial Bank of Ethiopia', category: 'Banking' },
        { name: 'Ethio Telecom', category: 'Telecommunications' },
        { name: 'African Union', category: 'International Relations' },
        { name: 'WHO Ethiopia', category: 'Health' },
        { name: 'WFP Ethiopia', category: 'Humanitarian' },
        { name: 'UNDP Ethiopia', category: 'Development' },
        { name: 'Save the Children Ethiopia', category: 'NGO' },
        { name: 'IRC Ethiopia', category: 'Humanitarian' },
        { name: 'Oxfam Ethiopia', category: 'NGO' },
        { name: 'CARE Ethiopia', category: 'NGO' },
        { name: 'MSF Ethiopia', category: 'Health' },
        { name: 'Red Cross Ethiopia', category: 'Humanitarian' },
    ];

    const jobTitles = [
        { title: 'Program Officer', level: 'Mid' },
        { title: 'Senior Finance Manager', level: 'Senior' },
        { title: 'Data Analyst', level: 'Entry' },
        { title: 'Project Coordinator', level: 'Mid' },
        { title: 'HR Specialist', level: 'Mid' },
        { title: 'M&E Officer', level: 'Mid' },
        { title: 'Communications Manager', level: 'Senior' },
        { title: 'IT Support Specialist', level: 'Entry' },
        { title: 'Logistics Officer', level: 'Mid' },
        { title: 'Country Director', level: 'Senior' },
        { title: 'Field Coordinator', level: 'Mid' },
        { title: 'Grant Writer', level: 'Mid' },
        { title: 'Public Health Specialist', level: 'Senior' },
        { title: 'Administrative Assistant', level: 'Entry' },
        { title: 'Driver / Mechanic', level: 'Entry' },
    ];

    const locations = [
        'Addis Ababa',
        'Dire Dawa',
        'Hawassa',
        'Bahir Dar',
        'Mekelle',
        'Gondar',
        'Jimma',
        'Jijiga',
        'Gambella',
        'Afar',
    ];

    const jobs = [];

    // Generate 50 Ethiopian jobs
    for (let i = 0; i < 50; i++) {
        const org = ethiopianOrgs[i % ethiopianOrgs.length];
        const job = jobTitles[i % jobTitles.length];
        const location = locations[i % locations.length];

        jobs.push({
            sourceId: `ethiopia-${Date.now()}-${i}`,
            title: job.title,
            organization: org.name,
            location: `${location}, Ethiopia`,
            country: 'Ethiopia',
            category: org.category,
            experienceLevel: job.level,
            description: `Join ${org.name} as a ${job.title} based in ${location}. We are looking for dedicated professionals to support our mission in Ethiopia.`,
            applyUrl: `https://ethiopiajobs.example.com/apply/${i}`,
            postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            closingDate: new Date(Date.now() + (14 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
            source: 'EthiopiaJobs',
            logo: null,
            salary: `${15000 + Math.floor(Math.random() * 40000)} - ${40000 + Math.floor(Math.random() * 60000)} ETB`,
            tags: [org.category, 'Ethiopia', location],
        });
    }

    return jobs;
};

/**
 * Map job type to experience level
 */
const mapJobType = (jobType) => {
    if (!jobType) return 'Mid';
    const type = jobType.toLowerCase();
    if (type.includes('intern') || type.includes('junior') || type.includes('entry') || type.includes('associate')) return 'Entry';
    if (type.includes('senior') || type.includes('lead') || type.includes('director') || type.includes('manager') || type.includes('head')) return 'Senior';
    return 'Mid';
};

/**
 * Aggregate jobs from all enabled sources
 */
const fetchAllJobs = async () => {
    logger.info('Starting multi-source job fetch (including Ethiopian jobs)');

    const results = await Promise.allSettled([
        SOURCES.REMOTEOK.enabled ? fetchRemoteOKJobs() : Promise.resolve([]),
        SOURCES.ARBEITNOW.enabled ? fetchArbeitnowJobs() : Promise.resolve([]),
        SOURCES.REMOTIVE.enabled ? fetchRemotiveJobs() : Promise.resolve([]),
        SOURCES.JOBICY.enabled ? fetchJobicyJobs() : Promise.resolve([]),
        SOURCES.HIMALAYAS.enabled ? fetchHimalayasJobs() : Promise.resolve([]),
        SOURCES.WEWORKREMOTELY.enabled ? fetchWeWorkRemotelyJobs() : Promise.resolve([]),
        // Disabled: generateEthiopianJobs adds fake sample data, not real jobs.
        // Real Ethiopian jobs come from ReliefWeb (filtered by Ethiopia) and ethio-job-api.
        // Promise.resolve(generateEthiopianJobs()),
        SOURCES.ETHIOJOBAPI.enabled ? fetchEthioJobApiJobs() : Promise.resolve([]), // Ethio Job API
    ]);

    const allJobs = [];
    const stats = {
        remoteok: 0,
        arbeitnow: 0,
        remotive: 0,
        jobicy: 0,
        himalayas: 0,
        weworkremotely: 0,
        ethiopia: 0,
        ethiojobapi: 0,
    };

    const sourceNames = ['remoteok', 'arbeitnow', 'remotive', 'jobicy', 'himalayas', 'weworkremotely', 'ethiopia', 'ethiojobapi'];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allJobs.push(...result.value);
            stats[sourceNames[index]] = result.value.length;
        }
    });

    logger.info('Multi-source fetch complete', { stats, total: allJobs.length });
    return { jobs: allJobs, stats };
};

/**
 * Save jobs to database
 */
const saveJobsToDatabase = async (jobs) => {
    const stats = { created: 0, updated: 0, errors: 0 };

    for (const job of jobs) {
        try {
            const result = await Job.findOneAndUpdate(
                { sourceId: job.sourceId },
                job,
                { upsert: true, new: true, runValidators: true }
            );

            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                stats.created++;
            } else {
                stats.updated++;
            }
        } catch (error) {
            logger.error(`Error saving job ${job.sourceId}`, error);
            stats.errors++;
        }
    }

    return stats;
};

/**
 * Main sync function - fetches from all sources and saves to DB
 */
const syncMultiSourceJobs = async () => {
    logger.info('Starting multi-source job sync');
    const startTime = Date.now();

    const result = {
        success: true,
        fetched: 0,
        created: 0,
        updated: 0,
        errors: 0,
        sources: {},
        errorMessage: null,
    };

    try {
        // Fetch from all APIs
        const { jobs, stats } = await fetchAllJobs();
        result.fetched = jobs.length;
        result.sources = stats;

        if (jobs.length === 0) {
            logger.warn('No jobs fetched from any source');
            return result;
        }

        // Save to database
        const saveStats = await saveJobsToDatabase(jobs);
        result.created = saveStats.created;
        result.updated = saveStats.updated;
        result.errors = saveStats.errors;

        // Clear cache
        clearCache();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Multi-source sync completed in ${duration}s`, { result });

    } catch (error) {
        result.success = false;
        result.errorMessage = error.message;
        logger.error('Multi-source sync failed', error);
    }

    return result;
};

/**
 * Clear all external jobs (for testing)
 */
const clearExternalJobs = async () => {
    const result = await Job.deleteMany({
        sourceId: { $regex: /^(remoteok-|arbeitnow-|remotive-|jobicy-|himalayas-|wwr-|ethiopia-)/ }
    });
    return result.deletedCount;
};

module.exports = {
    syncMultiSourceJobs,
    fetchRemoteOKJobs,
    fetchArbeitnowJobs,
    fetchRemotiveJobs,
    fetchJobicyJobs,
    fetchHimalayasJobs,
    fetchWeWorkRemotelyJobs,
    generateEthiopianJobs,
    fetchEthioJobApiJobs,
    clearExternalJobs,
};
