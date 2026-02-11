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

    // Job source
    source: {
        type: String,
        enum: [
            'reliefweb', 'ethiojobs', 'indeed', 'linkedin', 'sample', 'employer', 'ethio-job-api',
            'remoteok', 'remotive', 'arbeitnow',
            'RemoteOK', 'Arbeitnow', 'Remotive', 'Jobicy', 'Himalayas', 'WeWorkRemotely', 'EthiopiaJobs'
        ],
        default: 'reliefweb',
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

    // Company logo URL
    logo: {
        type: String,
        default: null
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
        required: true
    },

    // Dates
    postedDate: {
        type: Date,
        default: Date.now,
        index: true
    },

    closingDate: {
        type: Date
    },

    // Salary information
    salaryMin: {
        type: Number,
        default: null
    },
    salaryMax: {
        type: Number,
        default: null
    },
    salaryCurrency: {
        type: String,
        default: 'ETB'
    },

    // Work arrangement
    workType: {
        type: String,
        enum: ['on-site', 'remote', 'hybrid', 'unknown'],
        default: 'unknown',
        index: true
    },

    // Contract type
    contractType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'volunteer', 'unknown'],
        default: 'unknown'
    },

    // Employer-posted job fields
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },

    status: {
        type: String,
        enum: ['draft', 'active', 'closed', 'expired'],
        default: 'active',
        index: true
    },

    viewCount: {
        type: Number,
        default: 0
    },

    applyCount: {
        type: Number,
        default: 0
    },

    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },

    // Additional fields
    skills: [String],
    benefits: [String],
    requirements: String,
    salary: String,
    deadline: Date
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

// Text index for search (title and organization)
jobSchema.index({ title: 'text', organization: 'text' });

// ===================
// Model Export
// ===================
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
module.exports.API_LIMITS = API_LIMITS;
