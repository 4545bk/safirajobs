/**
 * Analytics Routes
 * Track views/clicks and provide stats to employers
 */

const express = require('express');
const mongoose = require('mongoose');
const JobView = require('../models/JobView');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticate, requireRole } = require('./auth');

const router = express.Router();

// ===================
// Tracking Endpoints (Public/Authenticated)
// ===================

/**
 * POST /api/analytics/view
 * Record a job view
 */
router.post('/view', async (req, res) => {
    try {
        const { jobId, visitorId, source = 'direct' } = req.body;

        if (!jobId || !visitorId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1. Get job to find employer
        const job = await Job.findById(jobId).select('postedBy');
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // 2. Check for duplicate view in last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingView = await JobView.findOne({
            jobId,
            visitorId,
            type: 'view',
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (existingView) {
            return res.json({ success: true, message: 'View already recorded' });
        }

        // 3. Create view record
        await JobView.create({
            jobId,
            employerId: job.postedBy,
            viewerId: req.user ? req.user._id : null, // Assuming optional auth might be added to app.js or handled here if token present
            visitorId,
            source,
            type: 'view'
        });

        // 4. Increment job view count (denormalized for fast access)
        await Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } });

        res.json({ success: true, message: 'View recorded' });
    } catch (error) {
        console.error('Track view error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/analytics/click
 * Record an apply button click
 */
router.post('/click', async (req, res) => {
    try {
        const { jobId, visitorId, source = 'direct' } = req.body;

        if (!jobId || !visitorId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const job = await Job.findById(jobId).select('postedBy');
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Record apply click
        await JobView.create({
            jobId,
            employerId: job.postedBy,
            viewerId: req.user ? req.user._id : null,
            visitorId,
            source,
            type: 'apply_click'
        });

        res.json({ success: true, message: 'Click recorded' });
    } catch (error) {
        console.error('Track click error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===================
// Reporting Endpoints (Employer Only)
// ===================

/**
 * GET /api/analytics/overview
 * Get aggregated stats for the logged-in employer
 */
router.get('/overview', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const employerId = req.user._id;

        // 1. Total Jobs
        const totalJobs = await Job.countDocuments({ postedBy: employerId });
        const activeJobs = await Job.countDocuments({ postedBy: employerId, status: 'active' });

        // 2. Total Views & Clicks
        const views = await JobView.countDocuments({ employerId, type: 'view' });
        const applyClicks = await JobView.countDocuments({ employerId, type: 'apply_click' });

        // 3. Actual Applications (from Application model if used)
        const jobs = await Job.find({ postedBy: employerId }).select('_id');
        const jobIds = jobs.map(j => j._id);

        // This assumes Application model has jobId field. 
        // Adjust if Application model schema differs.
        const applications = await Application.countDocuments({ jobId: { $in: jobIds } });

        res.json({
            success: true,
            data: {
                jobs: { total: totalJobs, active: activeJobs },
                views,
                applyClicks,
                applications,
                conversionRate: views > 0 ? Math.round((applications / views) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/analytics/daily
 * Get daily views/applications for chart (last 30 days)
 */
router.get('/daily', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const employerId = req.user._id;
        const days = 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Aggregate views per day
        const dailyViews = await JobView.aggregate([
            {
                $match: {
                    employerId: new mongoose.Types.ObjectId(employerId),
                    type: 'view',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Aggregate applications per day (using simplified query for now)
        // If Application model has createdAt
        const jobs = await Job.find({ postedBy: employerId }).select('_id');
        const jobIds = jobs.map(j => j._id);

        const dailyApplications = await Application.aggregate([
            {
                $match: {
                    jobId: { $in: jobIds },
                    appliedDate: { $gte: startDate } // appliedDate from schema
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Merge and fill gaps
        const labels = [];
        const viewData = [];
        const appData = [];

        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            const dateStr = d.toISOString().split('T')[0];

            // Format label (e.g., "Feb 5")
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const viewCount = dailyViews.find(v => v._id === dateStr)?.count || 0;
            const appCount = dailyApplications.find(a => a._id === dateStr)?.count || 0;

            labels.push(label);
            viewData.push(viewCount);
            appData.push(appCount);
        }

        // Simplify for mobile chart (take every 5th label to avoid crowding)
        const chartLabels = labels.map((l, i) => i % 5 === 0 ? l : '');

        res.json({
            success: true,
            data: {
                labels: chartLabels,
                datasets: [
                    { data: viewData, label: 'Views' },
                    { data: appData, label: 'Applications' }
                ]
            }
        });

    } catch (error) {
        console.error('Analytics daily error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
