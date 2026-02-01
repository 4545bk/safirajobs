/**
 * Structured logging utility
 * Outputs JSON logs for easy parsing by log aggregators
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

// Get configured log level (default: INFO in production, DEBUG in development)
const getLogLevel = () => {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    if (level && LOG_LEVELS[level] !== undefined) {
        return LOG_LEVELS[level];
    }
    return process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
};

const currentLevel = getLogLevel();

/**
 * Format log entry as JSON
 */
const formatLog = (level, message, data = {}) => {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data,
    });
};

/**
 * Logger object with level-based methods
 */
const logger = {
    debug: (message, data = {}) => {
        if (currentLevel <= LOG_LEVELS.DEBUG) {
            console.log(formatLog('DEBUG', message, data));
        }
    },

    info: (message, data = {}) => {
        if (currentLevel <= LOG_LEVELS.INFO) {
            console.log(formatLog('INFO', message, data));
        }
    },

    warn: (message, data = {}) => {
        if (currentLevel <= LOG_LEVELS.WARN) {
            console.warn(formatLog('WARN', message, data));
        }
    },

    error: (message, error = null, data = {}) => {
        if (currentLevel <= LOG_LEVELS.ERROR) {
            const errorData = error ? {
                error: error.message || String(error),
                stack: error.stack,
                ...data,
            } : data;
            console.error(formatLog('ERROR', message, errorData));
        }
    },

    /**
     * Log HTTP request (for middleware)
     */
    request: (req, res, duration) => {
        const data = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('user-agent'),
        };

        // Add query params if present (but not for health checks)
        if (Object.keys(req.query).length && req.path !== '/api/health') {
            data.query = req.query;
        }

        // Log level based on status code
        if (res.statusCode >= 500) {
            logger.error('Request failed', null, data);
        } else if (res.statusCode >= 400) {
            logger.warn('Request error', data);
        } else {
            logger.info('Request completed', data);
        }
    },

    /**
     * Log sync operation
     */
    sync: (action, stats = {}) => {
        logger.info(`Sync: ${action}`, { sync: stats });
    },
};

module.exports = logger;
