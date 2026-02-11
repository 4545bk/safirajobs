const mongoose = require('mongoose');

const jobViewSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    visitorId: {
        type: String, // Fingerprint/Device ID
        required: true
    },
    source: {
        type: String,
        enum: ['search', 'similar', 'external', 'social', 'direct', 'internal_form', 'quickapply', 'email', 'referral', 'api'],
        default: 'direct'
    },
    type: {
        type: String,
        enum: ['view', 'apply_click'],
        default: 'view'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 90 // Auto-delete after 90 days to save space? Or keep forever? 
        // Let's keep data for now, maybe add expiry later if needed.
    }
});

// Compound index for deduplication checks: finding recent views by same visitor on same job
jobViewSchema.index({ jobId: 1, visitorId: 1, createdAt: -1 });

module.exports = mongoose.model('JobView', jobViewSchema);
