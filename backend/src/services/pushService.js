/**
 * Push notification service using Expo Push API
 */

const Device = require('../models/Device');
const logger = require('../utils/logger');

// Expo Push API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notifications to all active devices
 * @param {Object} notification - { title, body, data }
 */
const sendPushToAllDevices = async (notification) => {
    try {
        // Get all active devices
        const devices = await Device.find({ isActive: true });

        if (devices.length === 0) {
            logger.info('No devices registered for push');
            return { sent: 0, failed: 0 };
        }

        // Build messages
        const messages = devices.map(device => ({
            to: device.pushToken,
            sound: 'default',
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
        }));

        // Send in batches of 100 (Expo limit)
        const results = { sent: 0, failed: 0, errors: [] };

        for (let i = 0; i < messages.length; i += 100) {
            const batch = messages.slice(i, i + 100);

            try {
                const response = await fetch(EXPO_PUSH_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(batch),
                });

                const data = await response.json();

                // Process results
                if (data.data) {
                    for (let j = 0; j < data.data.length; j++) {
                        const ticket = data.data[j];

                        if (ticket.status === 'ok') {
                            results.sent++;
                        } else {
                            results.failed++;
                            results.errors.push(ticket.message);

                            // Deactivate invalid tokens
                            if (ticket.details?.error === 'DeviceNotRegistered') {
                                await Device.findOneAndUpdate(
                                    { pushToken: batch[j].to },
                                    { isActive: false }
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                logger.error('Push batch failed', error);
                results.failed += batch.length;
            }
        }

        logger.info('Push notifications sent', results);
        return results;

    } catch (error) {
        logger.error('Failed to send push notifications', error);
        throw error;
    }
};

/**
 * Send new job notifications
 * @param {Array} newJobs - Array of new job objects
 */
const notifyNewJobs = async (newJobs) => {
    if (!newJobs || newJobs.length === 0) return;

    // If single job, send detailed notification
    if (newJobs.length === 1) {
        const job = newJobs[0];
        await sendPushToAllDevices({
            title: '🆕 New Job Posted',
            body: `${job.organization} | ${job.title}`,
            data: { jobId: job._id?.toString(), type: 'new_job' },
        });
    } else {
        // Multiple jobs - send summary
        await sendPushToAllDevices({
            title: '🆕 New Jobs Available',
            body: `${newJobs.length} new opportunities posted. Tap to view!`,
            data: { type: 'new_jobs', count: newJobs.length },
        });
    }
};

module.exports = {
    sendPushToAllDevices,
    notifyNewJobs,
};
