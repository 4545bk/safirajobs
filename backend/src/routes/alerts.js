/**
 * Job Alerts API Routes
 * CRUD operations for user job alert preferences
 */

const express = require('express');
const router = express.Router();
const JobAlert = require('../models/JobAlert');
const Device = require('../models/Device');

/**
 * GET /api/alerts
 * Get all alerts for a device
 */
router.get('/', async (req, res) => {
    try {
        const { deviceToken } = req.query;

        if (!deviceToken) {
            return res.status(400).json({
                success: false,
                error: 'deviceToken is required'
            });
        }

        const alerts = await JobAlert.find({ deviceToken })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/alerts
 * Create a new job alert
 */
router.post('/', async (req, res) => {
    try {
        const {
            deviceToken,
            name,
            categories,
            locations,
            keywords,
            organizations,
            experienceLevels,
            frequency
        } = req.body;

        if (!deviceToken) {
            return res.status(400).json({
                success: false,
                error: 'deviceToken is required'
            });
        }

        // Verify device exists
        const device = await Device.findOne({ pushToken: deviceToken });
        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not registered for push notifications'
            });
        }

        const alert = await JobAlert.create({
            deviceToken,
            name: name || 'My Job Alert',
            categories: categories || [],
            locations: locations || [],
            keywords: keywords || [],
            organizations: organizations || [],
            experienceLevels: experienceLevels || [],
            frequency: frequency || 'immediate'
        });

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/alerts/:id
 * Update an existing alert
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates._id;
        delete updates.deviceToken;
        delete updates.createdAt;

        const alert = await JobAlert.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await JobAlert.findByIdAndDelete(id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }

        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PATCH /api/alerts/:id/toggle
 * Toggle alert active status
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await JobAlert.findById(id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }

        alert.isActive = !alert.isActive;
        await alert.save();

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/alerts/options
 * Get available filter options (categories, locations, etc.)
 */
router.get('/options', async (req, res) => {
    try {
        const Job = require('../models/Job');

        // Get unique values from existing jobs
        const [categories, locations, organizations] = await Promise.all([
            Job.distinct('category'),
            Job.distinct('location'),
            Job.distinct('organization')
        ]);

        res.json({
            success: true,
            data: {
                categories: categories.filter(c => c).sort(),
                locations: locations.filter(l => l).sort(),
                organizations: organizations.filter(o => o).sort(),
                experienceLevels: ['Entry', 'Mid', 'Senior', 'Director'],
                frequencies: ['immediate', 'daily', 'weekly']
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
