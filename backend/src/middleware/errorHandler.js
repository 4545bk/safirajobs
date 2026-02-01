/**
 * Global error handler middleware
 */
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error with structured logger
    logger.error('Request error', err, {
        method: req.method,
        path: req.path,
        query: req.query,
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate entry'
        });
    }

    // Rate limit error
    if (err.status === 429) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests'
        });
    }

    // Default server error
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message
    });
};

module.exports = errorHandler;
