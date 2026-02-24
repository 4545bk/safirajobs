require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const connectDB = require('./config/database');
const jobRoutes = require('./routes/jobs');
const deviceRoutes = require('./routes/devices');
const cvRoutes = require('./routes/cv');
const analyticsRoutes = require('./routes/analytics'); // Added analytics routes import
const errorHandler = require('./middleware/errorHandler');
const pdfGenerator = require('./services/pdfGenerator');
const { syncJobs, cleanupJobs } = require('./services/reliefwebSync');
const { syncMultiSourceJobs, clearExternalJobs } = require('./services/multiSourceSync');
const { getStats: getCacheStats } = require('./middleware/cache');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================
// Rate Limiters
// ===================

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limit for sync endpoints
const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 syncs per hour max
    message: {
        success: false,
        error: 'Sync rate limit exceeded. Try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ===================
// Middleware
// ===================

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// JSON body parser
app.use(express.json());

// Apply general rate limit to all API routes
app.use('/api/', apiLimiter);

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        // Skip logging health checks to reduce noise
        if (req.path !== '/api/health') {
            logger.request(req, res, duration);
        }
    });

    next();
});

// ===================
// Routes
// ===================
app.use('/api/jobs', jobRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employer', require('./routes/employer'));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/apply', require('./routes/apply'));

// Health check with cache stats
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cache: getCacheStats(),
        memory: {
            heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
    });
});

// Seed sample data (for testing when ReliefWeb is unavailable)
const { seedJobs, clearSampleJobs } = require('./services/seedData');

app.post('/api/seed', async (req, res) => {
    try {
        const stats = await seedJobs();
        res.json({
            success: true,
            message: 'Sample jobs added',
            stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/seed', async (req, res) => {
    try {
        const count = await clearSampleJobs();
        res.json({
            success: true,
            message: `Removed ${count} sample jobs`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================
// Multi-Source Job Sync (Real Jobs from Multiple APIs)
// ===================

/**
 * POST /api/sync-multi
 * Sync jobs from multiple real APIs (RemoteOK, Arbeitnow, Remotive)
 * No API key required - all free sources
 */
app.post('/api/sync-multi', syncLimiter, async (req, res) => {
    try {
        logger.info('Multi-source sync triggered');
        const result = await syncMultiSourceJobs();

        res.json({
            success: result.success,
            message: result.success ? 'Multi-source sync completed' : 'Sync failed',
            data: {
                fetched: result.fetched,
                created: result.created,
                updated: result.updated,
                errors: result.errors,
                sources: result.sources,
            },
            error: result.errorMessage,
        });
    } catch (error) {
        logger.error('Multi-source sync endpoint error', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/sync-multi
 * Clear all jobs from external sources
 */
app.delete('/api/sync-multi', async (req, res) => {
    try {
        const count = await clearExternalJobs();
        res.json({
            success: true,
            message: `Removed ${count} external jobs`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================
// Cron/Sync Endpoints
// ===================

/**
 * External cron trigger endpoint
 * Protected by CRON_SECRET header
 * Use this with external cron services like cron-job.org
 */
app.get('/api/cron/sync', syncLimiter, async (req, res, next) => {
    try {
        // Verify secret
        const secret = req.headers['x-cron-secret'];
        const expectedSecret = process.env.CRON_SECRET;

        if (!expectedSecret) {
            logger.warn('CRON_SECRET not configured');
            return res.status(500).json({
                success: false,
                error: 'Cron endpoint not configured'
            });
        }

        if (!secret || secret !== expectedSecret) {
            logger.warn('Invalid cron secret attempted', { ip: req.ip });
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        logger.info('External cron sync triggered');
        const startTime = Date.now();

        // Sync from ALL sources (ReliefWeb + multi-source APIs)
        const [reliefWebResult, multiSourceResult] = await Promise.allSettled([
            syncJobs(),
            syncMultiSourceJobs(),
        ]);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        const stats = reliefWebResult.status === 'fulfilled' ? reliefWebResult.value : { success: false };
        const multiStats = multiSourceResult.status === 'fulfilled' ? multiSourceResult.value : { success: false };

        // Return structured response based on sync result
        if (stats.success || multiStats.success) {
            res.json({
                success: true,
                message: 'Sync completed (all sources)',
                duration: `${duration}s`,
                stats: {
                    reliefWeb: stats,
                    multiSource: multiStats,
                }
            });
        } else {
            // Sync failed after retries
            res.status(500).json({
                success: false,
                error: 'Sync failed after retries',
                message: stats.errorMessage,
                duration: `${duration}s`,
                partialStats: {
                    fetched: stats.fetched,
                    created: stats.created,
                    updated: stats.updated,
                    errors: stats.errors
                }
            });
        }
    } catch (error) {
        logger.error('External cron sync failed', error);
        next(error);
    }
});

/**
 * Manual sync endpoint (for local testing)
 * Also protected by rate limiting
 */
app.post('/api/sync', syncLimiter, async (req, res, next) => {
    try {
        // In production, also require secret
        if (process.env.NODE_ENV === 'production') {
            const secret = req.headers['x-cron-secret'];
            if (!secret || secret !== process.env.CRON_SECRET) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
        }

        console.log('Manual sync triggered');
        const startTime = Date.now();
        const stats = await syncJobs();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        res.json({
            success: true,
            message: 'Sync completed',
            duration: `${duration}s`,
            stats
        });
    } catch (error) {
        next(error);
    }
});

// Error handler (must be last)
app.use(errorHandler);

// ===================
// Keep-Alive (Prevent Render spin-down)
// ===================
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes

const startKeepAlive = () => {
    const externalUrl = process.env.RENDER_EXTERNAL_URL || 'https://safirajobs.onrender.com';
    if (process.env.NODE_ENV === 'production') {
        console.log('Keep-alive pings enabled →', externalUrl);

        setInterval(async () => {
            try {
                const response = await fetch(`${externalUrl}/api/health`);
                console.log(`Keep-alive ping: ${response.status}`);
            } catch (error) {
                console.error('Keep-alive ping failed:', error.message);
            }
        }, KEEP_ALIVE_INTERVAL);
    }
};

// ===================
// Start Server
// ===================
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize PDF Generator (optional - won't block server start if Chrome is missing)
        try {
            await pdfGenerator.init();
            console.log('✅ PDF Generator initialized');
        } catch (error) {
            console.warn('⚠️  PDF Generator failed to initialize:', error.message);
            console.warn('   CV PDFs will not be available, but server will continue running');
        }

        // Schedule internal cron job as fallback (every 6 hours by default)
        const cronSchedule = process.env.SYNC_CRON_SCHEDULE || '0 */6 * * *';
        cron.schedule(cronSchedule, async () => {
            console.log('Running internal scheduled sync (all sources)...');
            try {
                await Promise.allSettled([
                    syncJobs().catch(err => console.warn('⚠️  ReliefWeb sync failed:', err.message)),
                    syncMultiSourceJobs().catch(err => console.warn('⚠️  Multi-source sync failed:', err.message)),
                ]);
                console.log('Internal sync completed (all sources)');
            } catch (error) {
                console.error('Internal sync failed:', error.message);
            }
        });
        logger.info(`Sync cron scheduled: ${cronSchedule}`);

        // Schedule daily cleanup job (runs at 2 AM daily)
        cron.schedule('0 2 * * *', async () => {
            logger.info('Running daily cleanup job');
            try {
                const stats = await cleanupJobs(30); // 30 days for stale jobs
                logger.info('Daily cleanup completed', { stats });
            } catch (error) {
                logger.error('Daily cleanup failed', error);
            }
        });
        logger.info('Daily cleanup cron scheduled: 0 2 * * * (2 AM daily)');

        // Run initial sync on startup (both sources, neither blocks the server)
        console.log('Running initial sync on startup...');
        Promise.allSettled([
            syncJobs().catch(err => console.warn('⚠️  ReliefWeb sync skipped:', err.message)),
            syncMultiSourceJobs().catch(err => console.warn('⚠️  Multi-source sync skipped:', err.message)),
        ]).then(results => {
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            console.log(`✅ Initial sync complete (${succeeded}/${results.length} sources succeeded)`);
        });

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`External cron endpoint: GET /api/cron/sync (requires x-cron-secret header)`);

            // Start keep-alive pings in production
            startKeepAlive();
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
