/**
 * EthioJobs.net Scraper Service
 * Scrapes job listings from EthioJobs.net (Ethiopia's largest job portal)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');
const logger = require('../utils/logger');

const ETHIOJOBS_BASE_URL = 'https://www.ethiojobs.net';
const ETHIOJOBS_SEARCH_URL = `${ETHIOJOBS_BASE_URL}/display-category-jobs.php`;

/**
 * Map EthioJobs categories to our categories
 */
const mapCategory = (ethioCategory) => {
    const categoryMap = {
        'accounting': 'Finance/Accounting',
        'finance': 'Finance/Accounting',
        'it': 'Information Technology',
        'technology': 'Information Technology',
        'health': 'Health',
        'medical': 'Health',
        'education': 'Education',
        'hr': 'Human Resources',
        'logistics': 'Logistics/Procurement',
        'procurement': 'Logistics/Procurement',
        'admin': 'Administration',
        'marketing': 'Communications',
        'ngo': 'Program Management'
    };

    const normalized = ethioCategory.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
        if (normalized.includes(key)) return value;
    }
    return 'Other';
};

/**
 * Extract experience level from job description/title
 */
const extractExperienceLevel = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('senior') || lowerText.includes('manager') || lowerText.includes('head')) {
        return 'Senior';
    }
    if (lowerText.includes('junior') || lowerText.includes('entry') || lowerText.includes('assistant')) {
        return 'Entry';
    }
    if (lowerText.includes('director') || lowerText.includes('chief')) {
        return 'Director';
    }
    return 'Mid';
};

/**
 * Scrape jobs from EthioJobs.net
 * Note: This is a basic scraper. EthioJobs structure may change.
 */
const scrapeEthioJobs = async (limit = 100) => {
    try {
        logger.info('Starting EthioJobs scraper...');

        const response = await axios.get(ETHIOJOBS_BASE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const jobs = [];

        // Parse job listings (structure depends on EthioJobs HTML)
        $('.job-item, .job-listing, article').slice(0, limit).each((index, element) => {
            try {
                const $el = $(element);

                // Extract job data (adjust selectors based on actual site structure)
                const title = $el.find('h3, .job-title, a strong').first().text().trim();
                const organization = $el.find('.company-name, .organization').first().text().trim() || 'Unknown Company';
                const location = $el.find('.location').first().text().trim() || 'Addis Ababa';
                const category = $el.find('.category').first().text().trim() || '';
                const jobUrl = $el.find('a').first().attr('href') || '';

                if (title && title.length > 5) {
                    jobs.push({
                        sourceId: `ethiojobs-${Date.now()}-${index}`,
                        source: 'ethiojobs',
                        title,
                        organization,
                        location: location.includes('Ethiopia') ? location : `${location}, Ethiopia`,
                        country: 'Ethiopia',
                        category: mapCategory(category || title),
                        experienceLevel: extractExperienceLevel(title),
                        description: `${title} position at ${organization}. Please visit the job link for full details.`,
                        applyUrl: jobUrl.startsWith('http') ? jobUrl : `${ETHIOJOBS_BASE_URL}${jobUrl}`,
                        postedDate: new Date(),
                        closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
                    });
                }
            } catch (error) {
                logger.error(`Error parsing job element: ${error.message}`);
            }
        });

        logger.info(`Scraped ${jobs.length} jobs from EthioJobs`);
        return jobs;

    } catch (error) {
        logger.error(`EthioJobs scraping failed: ${error.message}`);
        throw new Error(`Failed to scrape EthioJobs: ${error.message}`);
    }
};

/**
 * Sync jobs from EthioJobs to database
 */
const syncEthioJobs = async () => {
    const startTime = Date.now();
    const stats = { fetched: 0, created: 0, updated: 0, errors: 0 };

    try {
        logger.info('Starting EthioJobs sync...');

        const jobs = await scrapeEthioJobs();
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
                logger.error(`Error saving EthioJobs job: ${error.message}`);
                stats.errors++;
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`EthioJobs sync completed in ${duration}s`, stats);

        return { success: true, stats, duration };

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.error(`EthioJobs sync failed after ${duration}s: ${error.message}`);
        return { success: false, error: error.message, stats, duration };
    }
};

module.exports = { syncEthioJobs, scrapeEthioJobs };
