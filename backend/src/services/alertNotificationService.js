/**
 * Alert Notification Service
 * Matches new jobs against user alerts and sends push notifications
 */

const JobAlert = require('../models/JobAlert');
const Device = require('../models/Device');
const { sendPushNotifications } = require('./pushService');
const logger = require('../utils/logger');

/**
 * Process new jobs and send notifications to matching alerts
 * @param {Array} newJobs - Array of newly created/updated jobs
 */
const notifyMatchingAlerts = async (newJobs) => {
    if (!newJobs || newJobs.length === 0) return { notified: 0 };

    const startTime = Date.now();
    const stats = { alerts: 0, matched: 0, notified: 0, errors: 0 };

    try {
        // Get all active alerts
        const alerts = await JobAlert.find({ isActive: true });
        stats.alerts = alerts.length;

        if (alerts.length === 0) {
            logger.info('No active alerts to process');
            return stats;
        }

        // Group notifications by device
        const deviceNotifications = new Map();

        for (const alert of alerts) {
            const matchingJobs = newJobs.filter(job => alert.matchesJob(job));

            if (matchingJobs.length > 0) {
                stats.matched++;

                // Add to device's notification queue
                if (!deviceNotifications.has(alert.deviceToken)) {
                    deviceNotifications.set(alert.deviceToken, {
                        alert,
                        jobs: []
                    });
                }

                deviceNotifications.get(alert.deviceToken).jobs.push(...matchingJobs);
            }
        }

        // Send notifications to each device
        for (const [deviceToken, { alert, jobs }] of deviceNotifications) {
            try {
                // Check if device exists and is active
                const device = await Device.findOne({ pushToken: deviceToken, isActive: true });
                if (!device) continue;

                // Create notification message
                const title = jobs.length === 1
                    ? '🔔 New Job Match!'
                    : `🔔 ${jobs.length} New Jobs Match!`;

                const body = jobs.length === 1
                    ? `${jobs[0].title} at ${jobs[0].organization}`
                    : `${jobs[0].title} and ${jobs.length - 1} more matching "${alert.name}"`;

                // Send push notification
                const result = await sendPushNotifications(
                    [deviceToken],
                    title,
                    body,
                    {
                        type: 'job_alert',
                        alertId: alert._id.toString(),
                        jobId: jobs[0]._id?.toString() || jobs[0].sourceId,
                        jobCount: jobs.length
                    }
                );

                if (result.successCount > 0) {
                    stats.notified++;

                    // Update alert stats
                    await JobAlert.updateOne(
                        { _id: alert._id },
                        {
                            $set: { lastNotifiedAt: new Date() },
                            $inc: { notificationCount: 1 }
                        }
                    );
                }

            } catch (error) {
                logger.error(`Failed to notify device ${deviceToken}:`, error.message);
                stats.errors++;
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Alert notifications processed in ${duration}s`, stats);

        return stats;

    } catch (error) {
        logger.error('Alert notification processing failed:', error);
        return stats;
    }
};

/**
 * Check if a single job matches any alerts and notify
 * Called when a new job is created
 */
const checkJobAgainstAlerts = async (job) => {
    return await notifyMatchingAlerts([job]);
};

/**
 * Process daily digest for users with daily frequency
 */
const sendDailyDigest = async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get alerts with daily frequency
    const alerts = await JobAlert.find({
        isActive: true,
        frequency: 'daily',
        $or: [
            { lastNotifiedAt: null },
            { lastNotifiedAt: { $lt: oneDayAgo } }
        ]
    });

    if (alerts.length === 0) return { processed: 0 };

    // Get jobs from last 24 hours
    const Job = require('../models/Job');
    const recentJobs = await Job.find({
        createdAt: { $gte: oneDayAgo }
    });

    return await notifyMatchingAlerts(recentJobs);
};

/**
 * Process weekly digest for users with weekly frequency
 */
const sendWeeklyDigest = async () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const alerts = await JobAlert.find({
        isActive: true,
        frequency: 'weekly',
        $or: [
            { lastNotifiedAt: null },
            { lastNotifiedAt: { $lt: oneWeekAgo } }
        ]
    });

    if (alerts.length === 0) return { processed: 0 };

    const Job = require('../models/Job');
    const recentJobs = await Job.find({
        createdAt: { $gte: oneWeekAgo }
    });

    return await notifyMatchingAlerts(recentJobs);
};

module.exports = {
    notifyMatchingAlerts,
    checkJobAgainstAlerts,
    sendDailyDigest,
    sendWeeklyDigest
};
