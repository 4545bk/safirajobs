/**
 * Applications API Routes
 * Track job application status and progress
 */

const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * GET /api/applications
 * Get all applications for a device
 */
router.get('/', async (req, res) => {
    try {
        const { deviceToken, status } = req.query;

        if (!deviceToken) {
            return res.status(400).json({ success: false, error: 'deviceToken is required' });
        }

        const query = { deviceToken };
        if (status && status !== 'all') query.status = status;

        const applications = await Application.find(query)
            .populate('jobId', 'title organization location category closingDate applyUrl')
            .sort({ updatedAt: -1 });

        res.json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/applications/stats
 * Get application statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const { deviceToken } = req.query;

        if (!deviceToken) {
            return res.status(400).json({ success: false, error: 'deviceToken is required' });
        }

        const stats = await Application.aggregate([
            { $match: { deviceToken } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const total = await Application.countDocuments({ deviceToken });

        res.json({
            success: true,
            data: {
                total,
                byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/applications
 * Create/track a new application
 */
router.post('/', async (req, res) => {
    try {
        const { deviceToken, jobId, status, notes, appliedVia } = req.body;

        if (!deviceToken || !jobId) {
            return res.status(400).json({ success: false, error: 'deviceToken and jobId required' });
        }

        // Check if already tracking
        const existing = await Application.findOne({ deviceToken, jobId });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Already tracking this job',
                data: existing
            });
        }

        // Get job details for snapshot
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        const application = await Application.create({
            deviceToken,
            jobId,
            status: status || 'saved',
            notes: notes || '',
            appliedVia: appliedVia || 'in-app',
            jobSnapshot: {
                title: job.title,
                organization: job.organization,
                location: job.location,
                category: job.category
            }
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/applications/:id
 * Update application (status, notes, etc.)
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        delete updates._id;
        delete updates.deviceToken;
        delete updates.jobId;

        const application = await Application.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        res.json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/applications/:id/status
 * Update application status with optional note
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        application.status = status;
        if (note) {
            application.statusHistory.push({ status, date: new Date(), note });
        }

        await application.save();

        res.json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/applications/:id
 * Stop tracking an application
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findByIdAndDelete(id);

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/applications/check/:jobId
 * Check if a job is being tracked
 */
router.get('/check/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { deviceToken } = req.query;

        if (!deviceToken) {
            return res.status(400).json({ success: false, error: 'deviceToken required' });
        }

        const application = await Application.findOne({ deviceToken, jobId });

        res.json({
            success: true,
            isTracking: !!application,
            data: application || null
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
