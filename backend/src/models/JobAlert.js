/**
 * JobAlert Model - User preferences for job notifications
 */

const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
    // Link to device push token
    deviceToken: {
        type: String,
        required: true,
        index: true
    },

    // Alert name (user-friendly label)
    name: {
        type: String,
        default: 'My Job Alert'
    },

    // Filter preferences
    categories: [{
        type: String
    }],

    locations: [{
        type: String
    }],

    keywords: [{
        type: String
    }],

    organizations: [{
        type: String
    }],

    experienceLevels: [{
        type: String,
        enum: ['Entry', 'Mid', 'Senior', 'Director']
    }],

    // Alert settings
    isActive: {
        type: Boolean,
        default: true
    },

    // Frequency: immediate, daily, weekly
    frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly'],
        default: 'immediate'
    },

    // Track last notification sent
    lastNotifiedAt: {
        type: Date,
        default: null
    },

    // Count of notifications sent
    notificationCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
jobAlertSchema.index({ isActive: 1, deviceToken: 1 });
jobAlertSchema.index({ categories: 1 });
jobAlertSchema.index({ locations: 1 });

/**
 * Check if a job matches this alert's criteria
 */
jobAlertSchema.methods.matchesJob = function (job) {
    // If no filters set, match all jobs
    const hasFilters =
        this.categories.length > 0 ||
        this.locations.length > 0 ||
        this.keywords.length > 0 ||
        this.organizations.length > 0 ||
        this.experienceLevels.length > 0;

    if (!hasFilters) return false; // Don't match if no preferences

    // Check category match
    if (this.categories.length > 0) {
        if (!this.categories.includes(job.category)) return false;
    }

    // Check location match
    if (this.locations.length > 0) {
        const jobLocation = job.location.toLowerCase();
        const matches = this.locations.some(loc =>
            jobLocation.includes(loc.toLowerCase())
        );
        if (!matches) return false;
    }

    // Check keyword match (in title or description)
    if (this.keywords.length > 0) {
        const searchText = `${job.title} ${job.description}`.toLowerCase();
        const matches = this.keywords.some(kw =>
            searchText.includes(kw.toLowerCase())
        );
        if (!matches) return false;
    }

    // Check organization match
    if (this.organizations.length > 0) {
        const jobOrg = job.organization.toLowerCase();
        const matches = this.organizations.some(org =>
            jobOrg.includes(org.toLowerCase())
        );
        if (!matches) return false;
    }

    // Check experience level match
    if (this.experienceLevels.length > 0) {
        if (!this.experienceLevels.includes(job.experienceLevel)) return false;
    }

    return true;
};

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);

module.exports = JobAlert;
