/**
 * Upload Routes - Handle image uploads via Cloudinary
 */

const express = require('express');
const router = express.Router();
const {
    uploadImage,
    uploadProfileImage,
    uploadCVImage,
    uploadCompanyLogo,
    deleteImage,
    isConfigured
} = require('../services/cloudinary');

// Middleware to check Cloudinary configuration
const checkCloudinary = (req, res, next) => {
    if (!isConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'Image upload service not configured',
        });
    }
    next();
};

/**
 * POST /api/upload/profile
 * Upload user profile image
 * Body: { userId, image } - image is base64 data
 */
router.post('/profile', checkCloudinary, async (req, res) => {
    try {
        const { userId, image } = req.body;

        if (!userId || !image) {
            return res.status(400).json({
                success: false,
                error: 'userId and image are required',
            });
        }

        const result = await uploadProfileImage(userId, image);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        console.error('Profile upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload profile image',
        });
    }
});

/**
 * POST /api/upload/cv
 * Upload CV preview image
 * Body: { userId, cvId, image }
 */
router.post('/cv', checkCloudinary, async (req, res) => {
    try {
        const { userId, cvId, image } = req.body;

        if (!userId || !cvId || !image) {
            return res.status(400).json({
                success: false,
                error: 'userId, cvId, and image are required',
            });
        }

        const result = await uploadCVImage(userId, cvId, image);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'CV image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        console.error('CV upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload CV image',
        });
    }
});

/**
 * POST /api/upload/logo
 * Upload company logo
 * Body: { companyName, image }
 */
router.post('/logo', checkCloudinary, async (req, res) => {
    try {
        const { companyName, image } = req.body;

        if (!companyName || !image) {
            return res.status(400).json({
                success: false,
                error: 'companyName and image are required',
            });
        }

        const result = await uploadCompanyLogo(companyName, image);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        console.error('Logo upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload logo',
        });
    }
});

/**
 * POST /api/upload/general
 * Upload any image
 * Body: { image, folder? }
 */
router.post('/general', checkCloudinary, async (req, res) => {
    try {
        const { image, folder = 'safirajobs/general' } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'image is required',
            });
        }

        const result = await uploadImage(image, { folder });

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: result,
        });
    } catch (error) {
        console.error('General upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image',
        });
    }
});

/**
 * DELETE /api/upload/:publicId
 * Delete an image
 */
router.delete('/:publicId', checkCloudinary, async (req, res) => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                error: 'publicId is required',
            });
        }

        const result = await deleteImage(publicId);

        res.json({
            success: result.success,
            message: result.success ? 'Image deleted successfully' : 'Failed to delete image',
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image',
        });
    }
});

/**
 * GET /api/upload/status
 * Check if upload service is configured
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        configured: isConfigured(),
        message: isConfigured()
            ? 'Cloudinary is configured and ready'
            : 'Cloudinary is not configured',
    });
});

module.exports = router;
