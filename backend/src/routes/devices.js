const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Device = require('../models/Device');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
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

/**
 * POST /api/devices
 * Register a device for push notifications
 */
router.post('/',
    body('pushToken')
        .isString()
        .matches(/^ExponentPushToken\[.+\]$/)
        .withMessage('Invalid Expo push token format'),
    body('platform')
        .optional()
        .isIn(['ios', 'android', 'web']),
    validate,
    async (req, res) => {
        try {
            const { pushToken, platform } = req.body;

            // Upsert device (update if exists, create if new)
            const device = await Device.findOneAndUpdate(
                { pushToken },
                { pushToken, platform, isActive: true, lastSeen: new Date() },
                { upsert: true, new: true }
            );

            logger.info('Device registered', {
                token: pushToken.slice(0, 30) + '...',
                platform
            });

            res.status(201).json({
                success: true,
                message: 'Device registered for push notifications'
            });
        } catch (error) {
            logger.error('Failed to register device', error);
            res.status(500).json({
                success: false,
                error: 'Failed to register device'
            });
        }
    }
);

/**
 * DELETE /api/devices/:token
 * Unregister a device from push notifications
 */
router.delete('/:token',
    param('token').isString(),
    validate,
    async (req, res) => {
        try {
            const token = decodeURIComponent(req.params.token);

            const result = await Device.findOneAndUpdate(
                { pushToken: token },
                { isActive: false }
            );

            if (result) {
                logger.info('Device unregistered', { token: token.slice(0, 30) + '...' });
            }

            res.json({
                success: true,
                message: 'Device unregistered'
            });
        } catch (error) {
            logger.error('Failed to unregister device', error);
            res.status(500).json({
                success: false,
                error: 'Failed to unregister device'
            });
        }
    }
);

/**
 * GET /api/devices/count
 * Get registered device count (for admin/stats)
 */
router.get('/count', async (req, res) => {
    try {
        const count = await Device.countDocuments({ isActive: true });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get device count'
        });
    }
});

module.exports = router;
