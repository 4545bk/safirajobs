const express = require('express');
const { query, param, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { API_LIMITS } = require('../models/Job');
const { cacheMiddleware } = require('../middleware/cache');
const { optionalAuthenticate } = require('./auth');
const { addMatchDataToJobs } = require('../services/jobMatching');

const router = express.Router();

// ===================
// Validation Middleware
// ===================

/**
 * Handle validation errors - returns 400 with details
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// ===================
// Validation Rules (with hard limits)
// ===================

const listJobsValidation = [
    query('page')
        .optional()
        .isInt({ min: 1, max: API_LIMITS.MAX_PAGE })
        .withMessage(`Page must be between 1 and ${API_LIMITS.MAX_PAGE}`)
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: API_LIMITS.MAX_LIMIT })
        .withMessage(`Limit must be between 1 and ${API_LIMITS.MAX_LIMIT}`)
        .toInt(),
    query('location')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must be under 100 characters')
        .escape(),
    query('category')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must be under 100 characters')
        .escape(),
    query('experience')
        .optional()
        .isIn(['Entry', 'Mid', 'Senior', 'Unknown'])
        .withMessage('Experience must be Entry, Mid, Senior, or Unknown'),
    query('search')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Search must be 2-100 characters'),
    query('sort')
        .optional()
        .isIn(['closing', 'posted', 'created'])
        .withMessage('Sort must be closing, posted, or created')
];

const getJobValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid job ID format')
];

// ===================
// Routes
// ===================

/**
 * GET /api/jobs
 * List jobs with optional filters and pagination
 * Cached for 5 minutes
 * 
 * Sort options:
 * - closing: By closing date (soonest first, then newest)
 * - posted: By posted date (newest first)
 * - created: By created date (newest first)
 */
router.get('/', optionalAuthenticate, cacheMiddleware(5 * 60 * 1000), listJobsValidation, validate, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = API_LIMITS.DEFAULT_LIMIT,
            location,
            category,
            experience,
            search,
            sort = 'closing'
        } = req.query;

        // Build query object
        const queryObj = {};

        // Location filter (case-insensitive partial match)
        if (location) {
            queryObj.location = { $regex: location, $options: 'i' };
        }

        // Category filter (case-insensitive partial match)
        if (category) {
            queryObj.category = { $regex: category, $options: 'i' };
        }

        // Experience filter (exact match - uses index)
        if (experience) {
            queryObj.experienceLevel = experience;
        }

        // Work Type filter
        if (req.query.workType && req.query.workType !== 'All') {
            queryObj.workType = req.query.workType.toLowerCase();
        }

        // Contract Type filter
        if (req.query.contractType && req.query.contractType !== 'All') {
            // Clean up the input to match enum (e.g. "Full-Time" -> "full-time")
            queryObj.contractType = req.query.contractType.toLowerCase().replace(' ', '-');
        }

        // Posted Within filter (Date Logic)
        if (req.query.postedWithin && req.query.postedWithin !== 'all') {
            const days = parseInt(req.query.postedWithin);
            if (!isNaN(days)) {
                const date = new Date();
                date.setDate(date.getDate() - days);
                queryObj.postedDate = { $gte: date };
            }
        }

        // Text search (uses text index)
        if (search) {
            queryObj.$text = { $search: search };
        }

        // Only show jobs with future closing dates or no closing date
        queryObj.$or = [
            { closingDate: { $gte: new Date() } },
            { closingDate: null }
        ];

        // Pagination (validated values)
        const pageNum = page;
        const limitNum = limit;
        const skip = (pageNum - 1) * limitNum;

        // Determine sort order (all use indexes)
        let sortOrder;
        switch (sort) {
            case 'posted':
                sortOrder = { postedDate: -1, createdAt: -1 };
                break;
            case 'created':
                sortOrder = { createdAt: -1 };
                break;
            case 'closing':
            default:
                // Soonest closing first (nulls last), then by newest
                sortOrder = { closingDate: 1, createdAt: -1 };
                break;
        }

        // Execute query with indexes
        let [jobs, total] = await Promise.all([
            Job.find(queryObj)
                .select('-description -__v') // Exclude full description and version key
                .sort(sortOrder)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Job.countDocuments(queryObj)
        ]);

        // Calculate match scores if user is logged in
        if (req.user) {
            jobs = await addMatchDataToJobs(jobs, req.user._id);
        }

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                    hasMore: pageNum < Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/:id
 * Get single job by ID
 * Cached for 10 minutes
 */
router.get('/:id', cacheMiddleware(10 * 60 * 1000), getJobValidation, validate, async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id)
            .select('-__v') // Exclude version key
            .lean();

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        // Handle invalid ObjectId (shouldn't happen with validation)
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }
        next(error);
    }
});

/**
 * GET /api/jobs/:id/similar
 * Get similar jobs based on category, location, experience level
 */
router.get('/:id/similar', cacheMiddleware(10 * 60 * 1000), getJobValidation, validate, async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).lean();

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Find similar jobs by category and location
        const similarJobs = await Job.find({
            _id: { $ne: job._id },
            $or: [
                { category: job.category },
                { location: { $regex: job.location?.split(',')[0] || '', $options: 'i' } },
                { organization: job.organization }
            ],
            closingDate: { $gte: new Date() }
        })
            .select('-description -__v')
            .sort({ category: job.category ? -1 : 1, postedDate: -1 })
            .limit(5)
            .lean();

        res.json({ success: true, count: similarJobs.length, data: similarJobs });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/company/:name
 * Get all jobs from a specific company/organization
 */
router.get('/company/:name', cacheMiddleware(10 * 60 * 1000), async (req, res, next) => {
    try {
        const { name } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const query = {
            organization: { $regex: name, $options: 'i' },
            $or: [
                { closingDate: { $gte: new Date() } },
                { closingDate: null }
            ]
        };

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .select('-description -__v')
                .sort({ postedDate: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
            Job.countDocuments(query)
        ]);

        // Get company info from first job
        const companyInfo = jobs.length > 0 ? {
            name: jobs[0].organization,
            totalJobs: total,
            categories: [...new Set(jobs.map(j => j.category).filter(Boolean))],
            locations: [...new Set(jobs.map(j => j.location).filter(Boolean))]
        } : null;

        res.json({
            success: true,
            data: {
                company: companyInfo,
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
