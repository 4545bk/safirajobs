/**
 * Authentication Routes
 * Register, Login, Profile management for all user roles
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET must be set in production environment');
}
const FALLBACK_SECRET = 'safirajobs-dev-secret-DO-NOT-USE-IN-PRODUCTION';
const SECRET = JWT_SECRET || FALLBACK_SECRET;
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Auth middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token expired or invalid' });
    }
};

// Optional Auth middleware (doesn't block if no token)
const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user && user.isActive) {
            req.user = user;
        }
        next();
    } catch (error) {
        // Ignore invalid tokens for optional auth
        next();
    }
};

// Role-based middleware
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

/**
 * POST /api/auth/register
 * Register a new user (jobseeker or employer)
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, role = 'jobseeker', profile = {} } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Validate role
        const validRoles = ['jobseeker', 'employer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be jobseeker or employer'
            });
        }

        // Create user
        const user = new User({
            email: email.toLowerCase(),
            password,
            role,
            profile: {
                name: profile.name || profile.fullName || '',
                company: profile.company || '',
                phone: profile.phone || '',
            },
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: user.toPublicJSON(),
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: user.toPublicJSON(),
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: req.user.toPublicJSON(),
    });
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { profile, skills, experience, education } = req.body;
        const user = req.user;

        if (profile) {
            Object.assign(user.profile, profile);
        }
        if (skills) user.skills = skills;
        if (experience) user.experience = experience;
        if (education) user.education = education;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated',
            data: user.toPublicJSON(),
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new password required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        req.user.password = newPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            data: user.toPublicJSON(),
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, title, email, phone, bio, avatar } = req.body;
        const user = req.user;

        // Update profile fields
        if (name !== undefined) user.profile.name = name;
        if (title !== undefined) user.profile.title = title;
        if (phone !== undefined) user.profile.phone = phone;
        if (bio !== undefined) user.profile.bio = bio;
        if (avatar !== undefined) user.profile.avatar = avatar;

        // Email update (requires validation/verification in real app)
        // For now, allow it but ensure uniqueness
        if (email && email !== user.email) {
            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email.toLowerCase();
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user.toPublicJSON(),
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================================================================
// DELETE ACCOUNT — Required by Google Play policy (April 2023)
// ================================================================
router.delete('/account', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all user-related data
        const mongoose = require('mongoose');

        // Delete applications if model exists
        try {
            const Application = mongoose.model('Application');
            await Application.deleteMany({ userId });
        } catch (e) { /* Model may not exist */ }

        // Delete device tokens
        try {
            const Device = mongoose.model('Device');
            await Device.deleteMany({ userId });
        } catch (e) { /* Model may not exist */ }

        // Delete any employer-posted jobs
        const Job = require('../models/Job');
        await Job.deleteMany({ postedBy: userId });

        // Delete the user account
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'Account and all associated data deleted successfully',
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
});

module.exports = router;
module.exports.authenticate = authenticate;
module.exports.optionalAuthenticate = optionalAuthenticate;
module.exports.requireRole = requireRole;
