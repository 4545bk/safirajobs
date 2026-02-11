/**
 * Employer Routes
 * Job posting, applicant management, dashboard stats
 */

const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticate, requireRole } = require('./auth');
const router = express.Router();

/**
 * GET /api/employer/dashboard
 * Get employer dashboard statistics
 */
router.get('/dashboard', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const employerId = req.user._id;

        // Get all employer's jobs
        const jobs = await Job.find({ postedBy: employerId });
        const jobIds = jobs.map(j => j._id);

        // Get applications for employer's jobs
        const applications = await Application.find({ jobId: { $in: jobIds } });

        // Calculate stats
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(j => j.status === 'active').length;
        const totalViews = jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0);
        const totalApplications = applications.length;

        // Application breakdown
        const applicationsByStatus = {
            applied: applications.filter(a => a.status === 'applied').length,
            reviewing: applications.filter(a => a.status === 'reviewing').length,
            interview: applications.filter(a => a.status === 'interview').length,
            offered: applications.filter(a => a.status === 'offered').length,
            rejected: applications.filter(a => a.status === 'rejected').length,
            hired: applications.filter(a => a.status === 'hired').length,
        };

        // Recent applications
        const recentApplications = await Application.find({ jobId: { $in: jobIds } })
            .sort({ appliedDate: -1 })
            .limit(5)
            .lean();

        // Top performing jobs
        const topJobs = jobs
            .sort((a, b) => (b.applyCount || 0) - (a.applyCount || 0))
            .slice(0, 5)
            .map(j => ({
                id: j._id,
                title: j.title,
                views: j.viewCount || 0,
                applications: j.applyCount || 0,
                status: j.status,
            }));

        res.json({
            success: true,
            data: {
                stats: {
                    totalJobs,
                    activeJobs,
                    totalViews,
                    totalApplications,
                    conversionRate: totalViews > 0
                        ? ((totalApplications / totalViews) * 100).toFixed(1)
                        : 0,
                },
                applicationsByStatus,
                recentApplications,
                topJobs,
            },
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/employer/jobs
 * Get all jobs posted by employer
 */
router.get('/jobs', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = { postedBy: req.user._id };

        if (status && status !== 'all') {
            query.status = status;
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Job.countDocuments(query);

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get employer jobs error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/employer/jobs
 * Create a new job posting
 */
router.post('/jobs', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const {
            title, description, requirements, location, category,
            type, experienceLevel, salary, deadline, skills, benefits,
            workType, isFeatured
        } = req.body;

        // Validation
        if (!title || !description || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and location are required',
            });
        }

        const job = new Job({
            title,
            description,
            requirements: requirements || '',
            location,
            category: category || 'General',
            type: type || 'full-time',
            experienceLevel: experienceLevel || 'Mid',
            salary: salary || 'Negotiable',
            deadline: deadline ? new Date(deadline) : null,
            skills: skills || [],
            benefits: benefits || [],
            workType: workType || 'on-site',
            organization: req.user.profile.company || req.user.profile.name,
            postedBy: req.user._id,
            status: 'active',
            source: 'employer',
            isExternal: false,
            isFeatured: isFeatured || false,
            viewCount: 0,
            applyCount: 0,
            postedDate: new Date(),
        });

        await job.save();

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: job,
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/employer/jobs/:id
 * Update a job posting
 */
router.put('/jobs/:id', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            postedBy: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not authorized',
            });
        }

        const allowedUpdates = [
            'title', 'description', 'requirements', 'location', 'category',
            'type', 'experienceLevel', 'salary', 'deadline', 'skills',
            'benefits', 'workType', 'status', 'isFeatured'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        await job.save();

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: job,
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * DELETE /api/employer/jobs/:id
 * Delete a job posting
 */
router.delete('/jobs/:id', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            postedBy: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not authorized',
            });
        }

        res.json({
            success: true,
            message: 'Job deleted successfully',
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/employer/jobs/:id/applicants
 * Get all applicants for a job
 */
router.get('/jobs/:id/applicants', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        // Verify job ownership
        const job = await Job.findOne({
            _id: req.params.id,
            postedBy: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not authorized',
            });
        }

        const applications = await Application.find({ jobId: req.params.id })
            .sort({ appliedDate: -1 })
            .lean();

        res.json({
            success: true,
            data: {
                job: {
                    id: job._id,
                    title: job.title,
                },
                applicants: applications,
                total: applications.length,
            },
        });
    } catch (error) {
        console.error('Get applicants error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PATCH /api/employer/applicants/:id/status
 * Update applicant status
 */
router.patch('/applicants/:id/status', authenticate, requireRole('employer', 'admin'), async (req, res) => {
    try {
        const { status, note } = req.body;

        const validStatuses = ['applied', 'reviewing', 'interview', 'offered', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        // Verify employer owns the job
        const job = await Job.findOne({
            _id: application.jobId,
            postedBy: req.user._id
        });

        if (!job) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application',
            });
        }

        application.status = status;
        if (note) {
            application.notes = application.notes
                ? `${application.notes}\n[${new Date().toISOString()}] ${note}`
                : `[${new Date().toISOString()}] ${note}`;
        }

        await application.save();

        res.json({
            success: true,
            message: 'Applicant status updated',
            data: application,
        });
    } catch (error) {
        console.error('Update applicant status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
