/**
 * Indeed Ethiopia Job Scraper
 * Scrapes job listings from Indeed.com for Ethiopia
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');
const logger = require('../utils/logger');

const INDEED_BASE_URL = 'https://et.indeed.com';
const INDEED_SEARCH_URL = `${INDEED_BASE_URL}/jobs`;

/**
 * Map Indeed categories to our categories
 */
const mapCategory = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();

    if (text.match(/health|medical|doctor|nurse|clinic/)) return 'Health';
    if (text.match(/education|teacher|training|academic/)) return 'Education';
    if (text.match(/finance|accounting|audit|budget/)) return 'Finance/Accounting';
    if (text.match(/IT|software|developer|programmer|tech/)) return 'Information Technology';
    if (text.match(/logistics|supply|procurement|warehouse/)) return 'Logistics/Procurement';
    if (text.match(/hr|human resource|recruitment/)) return 'Human Resources';
    if (text.match(/program|project|coordinator/)) return 'Program Management';
    if (text.match(/communication|marketing|media/)) return 'Communications';
    if (text.match(/m&e|monitoring|evaluation|data/)) return 'Monitoring & Evaluation';
    if (text.match(/admin|office|receptionist/)) return 'Administration';

    return 'Other';
};

/**
 * Extract experience level
 */
const extractExperienceLevel = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/senior|lead|principal|manager|head/)) return 'Senior';
    if (lower.match(/director|chief|vp|executive/)) return 'Director';
    if (lower.match(/junior|entry|associate|assistant|intern/)) return 'Entry';
    return 'Mid';
};

/**
 * Scrape jobs from Indeed Ethiopia
 */
const scrapeIndeedJobs = async (limit = 100) => {
    try {
        logger.info('Starting Indeed Ethiopia scraper...');

        const response = await axios.get(INDEED_SEARCH_URL, {
            params: {
                q: 'NGO OR humanitarian OR development',
                l: 'Ethiopia',
                limit: limit
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const jobs = [];

        // Parse job cards (Indeed structure)
        $('.job_seen_beacon, .jobsearch-SerpJobCard, .slider_item').slice(0, limit).each((index, element) => {
            try {
                const $el = $(element);

                const title = $el.find('.jobTitle, h2 a').first().text().trim();
                const organization = $el.find('.companyName').first().text().trim() || 'Unknown Company';
                const location = $el.find('.companyLocation').first().text().trim() || 'Ethiopia';
                const description = $el.find('.job-snippet').first().text().trim() || '';
                const jobKey = $el.find('a[data-jk], .jcs-JobTitle').attr('data-jk') || `indeed-${index}`;

                if (title && title.length > 3) {
                    jobs.push({
                        sourceId: `indeed-${jobKey}`,
                        source: 'indeed',
                        title,
                        organization,
                        location: location.includes('Ethiopia') ? location : `${location}, Ethiopia`,
                        country: 'Ethiopia',
                        category: mapCategory(title, description),
                        experienceLevel: extractExperienceLevel(title),
                        description: description || `${title} at ${organization}. Check Indeed for full details.`,
                        applyUrl: `${INDEED_BASE_URL}/viewjob?jk=${jobKey}`,
                        postedDate: new Date(),
                        closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    });
                }
            } catch (error) {
                logger.error(`Error parsing Indeed job: ${error.message}`);
            }
        });

        logger.info(`Scraped ${jobs.length} jobs from Indeed`);
        return jobs;

    } catch (error) {
        logger.error(`Indeed scraping failed: ${error.message}`);
        throw new Error(`Failed to scrape Indeed: ${error.message}`);
    }
};

/**
 * Sync jobs from Indeed to database
 */
const syncIndeedJobs = async () => {
    const startTime = Date.now();
    const stats = { fetched: 0, created: 0, updated: 0, errors: 0 };

    try {
        logger.info('Starting Indeed sync...');

        const jobs = await scrapeIndeedJobs();
        stats.fetched = jobs.length;

        for (const job of jobs) {
            try {
                const existing = await Job.findOne({ sourceId: job.sourceId });

                if (existing) {
                    await Job.updateOne({ sourceId: job.sourceId }, job);
                    stats.updated++;
                } else {
                    await Job.create(job);
                    stats.created++;
                }
            } catch (error) {
                logger.error(`Error saving Indeed job: ${error.message}`);
                stats.errors++;
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Indeed sync completed in ${duration}s`, stats);

        return { success: true, stats, duration };

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.error(`Indeed sync failed after ${duration}s: ${error.message}`);
        return { success: false, error: error.message, stats, duration };
    }
};

module.exports = { syncIndeedJobs, scrapeIndeedJobs };
