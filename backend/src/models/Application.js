/**
 * Application Model - Track job application status
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    // Device token (for non-authenticated users)
    deviceToken: {
        type: String,
        required: true,
        index: true
    },

    // Reference to job
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },

    // Job snapshot (in case job is deleted)
    jobSnapshot: {
        title: String,
        organization: String,
        location: String,
        category: String
    },

    // Application status
    status: {
        type: String,
        enum: ['saved', 'applied', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
        default: 'saved',
        index: true
    },

    // Status history
    statusHistory: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String
    }],

    // User notes
    notes: {
        type: String,
        default: ''
    },

    // Important dates
    appliedDate: Date,
    interviewDate: Date,
    responseDate: Date,

    // Application method
    appliedVia: {
        type: String,
        enum: ['in-app', 'website', 'email', 'referral', 'other'],
        default: 'in-app'
    },

    // Contact info for this application
    contactName: String,
    contactEmail: String,

    // Priority/importance
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },

    // Reminder for follow-up
    reminderDate: Date,
    reminderEnabled: {
        type: Boolean,
        default: false
    },

    // Applicant details (for in-app applications)
    applicantEmail: String,
    applicantPhone: String,
    resumeUrl: String,
    coverLetter: String,

    // Email tracking
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: Date

}, {
    timestamps: true
});

// Compound index for efficient queries
applicationSchema.index({ deviceToken: 1, status: 1 });
applicationSchema.index({ deviceToken: 1, jobId: 1 }, { unique: true });

// Add status to history when status changes
applicationSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            date: new Date()
        });

        // Set appliedDate when moving to applied
        if (this.status === 'applied' && !this.appliedDate) {
            this.appliedDate = new Date();
        }
    }
    next();
});

// Virtual for days since applied
applicationSchema.virtual('daysSinceApplied').get(function () {
    if (!this.appliedDate) return null;
    const diffTime = Math.abs(new Date() - this.appliedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
