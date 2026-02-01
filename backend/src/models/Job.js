const mongoose = require('mongoose');

// ===================
// API Limits (exported for use in routes)
// ===================
const API_LIMITS = {
    MAX_PAGE: 1000,
    MAX_LIMIT: 50,
    DEFAULT_LIMIT: 20,
};

// ===================
// Job Schema
// ===================
const jobSchema = new mongoose.Schema({
    // ReliefWeb source ID (unique identifier from their API)
    sourceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Job details
    title: {
        type: String,
        required: true
    },

    organization: {
        type: String,
        required: true
    },

    // Location info
    location: {
        type: String,
        default: 'Ethiopia',
        index: true
    },

    country: {
        type: String,
        default: 'Ethiopia'
    },

    // Categorization
    category: {
        type: String,
        default: 'General',
        index: true
    },

    experienceLevel: {
        type: String,
        enum: ['Entry', 'Mid', 'Senior', 'Unknown'],
        default: 'Unknown',
        index: true
    },

    // Full description (HTML allowed)
    description: {
        type: String,
        default: ''
    },

    // Original application URL
    applyUrl: {
        type: String,
        required: true,
        unique: true
    },

    // Dates
    postedDate: {
        type: Date,
        default: Date.now,
        index: true
    },

    closingDate: {
        type: Date,
        index: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// ===================
// Indexes
// ===================

// Compound index for common filter queries (uses all three fields together)
jobSchema.index({ location: 1, category: 1, experienceLevel: 1 });

// Compound index for default sort order (closingDate ASC for urgency, then createdAt DESC)
jobSchema.index({ closingDate: 1, createdAt: -1 });

// Index for cleanup queries (finding expired jobs)
jobSchema.index({ closingDate: 1 });

// Index for finding stale jobs (cleanup)
jobSchema.index({ createdAt: 1 });

// Text index for search (title and organization)
jobSchema.index({ title: 'text', organization: 'text' });

// ===================
// Model Export
// ===================
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
module.exports.API_LIMITS = API_LIMITS;
