/**
 * Cloudinary Configuration and Upload Service
 * Handles image uploads for user profiles, CVs, and other images
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 image data or URL
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadImage = async (imageData, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'safirajobs',
            resource_type: 'image',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        };

        const uploadOptions = { ...defaultOptions, ...options };

        // Handle base64 images
        if (imageData.startsWith('data:image')) {
            // Already in correct format
        } else if (!imageData.startsWith('http')) {
            // Add data URI prefix if missing
            imageData = `data:image/jpeg;base64,${imageData}`;
        }

        const result = await cloudinary.uploader.upload(imageData, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Upload user profile image
 * @param {string} userId - User ID
 * @param {string} imageData - Base64 image data
 * @returns {Promise<object>} - Upload result
 */
const uploadProfileImage = async (userId, imageData) => {
    return uploadImage(imageData, {
        folder: 'safirajobs/profiles',
        public_id: `profile_${userId}`,
        overwrite: true,
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
    });
};

/**
 * Upload CV/Resume document image (for preview thumbnails)
 * @param {string} userId - User ID
 * @param {string} cvId - CV ID
 * @param {string} imageData - Base64 image data
 * @returns {Promise<object>} - Upload result
 */
const uploadCVImage = async (userId, cvId, imageData) => {
    return uploadImage(imageData, {
        folder: 'safirajobs/cvs',
        public_id: `cv_${userId}_${cvId}`,
        overwrite: true,
    });
};

/**
 * Upload company logo
 * @param {string} companyName - Company name (used for ID)
 * @param {string} imageData - Base64 image data or URL
 * @returns {Promise<object>} - Upload result
 */
const uploadCompanyLogo = async (companyName, imageData) => {
    const safeId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return uploadImage(imageData, {
        folder: 'safirajobs/logos',
        public_id: `logo_${safeId}`,
        overwrite: true,
        transformation: [
            { width: 200, height: 200, crop: 'fit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
    });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} - Delete result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result,
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Image transformations
 * @returns {string} - Optimized image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
    const defaultTransformations = {
        quality: 'auto',
        fetch_format: 'auto',
    };

    return cloudinary.url(publicId, {
        ...defaultTransformations,
        ...transformations,
        secure: true,
    });
};

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
const isConfigured = () => {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
};

module.exports = {
    cloudinary,
    uploadImage,
    uploadProfileImage,
    uploadCVImage,
    uploadCompanyLogo,
    deleteImage,
    getOptimizedUrl,
    isConfigured,
};
