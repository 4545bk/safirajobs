/**
 * User Model
 * Supports multiple roles: jobseeker, employer, admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['jobseeker', 'employer', 'admin'],
        default: 'jobseeker',
    },
    profile: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        bio: { type: String, default: '' },
        avatar: { type: String, default: '' },
        // Employer-specific fields
        company: { type: String, default: '' },
        companyLogo: { type: String, default: '' },
        companyWebsite: { type: String, default: '' },
        companySize: { type: String, default: '' },
        industry: { type: String, default: '' },
        location: { type: String, default: '' },
    },
    // For job seekers
    skills: [String],
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String,
    }],
    education: [{
        degree: String,
        institution: String,
        year: String,
    }],
    // Account status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // Push notifications
    pushToken: { type: String },
    deviceToken: { type: String },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (hide sensitive data)
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        email: this.email,
        role: this.role,
        profile: this.profile,
        skills: this.skills,
        experience: this.experience,
        education: this.education,
        isVerified: this.isVerified,
        createdAt: this.createdAt,
    };
};

// Index for faster queries
// email index already created by unique: true in schema
userSchema.index({ role: 1 });
userSchema.index({ 'profile.company': 1 });

module.exports = mongoose.model('User', userSchema);
