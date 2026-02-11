/**
 * Apply Routes - Handle job applications with email sending
 * Hybrid approach: email if possible, open external URL if not
 */

const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendApplicationEmail, isEmailConfigured } = require('../services/emailService');
const { uploadImage, isConfigured: isCloudinaryConfigured } = require('../services/cloudinary');

/**
 * POST /api/apply
 * Submit a job application
 * 
 * Body: {
 *   deviceToken, jobId, 
 *   applicantName, applicantEmail, applicantPhone,
 *   coverLetter, resumeBase64, resumeName
 * }
 * 
 * Flow:
 * 1. Save application to database
 * 2. Upload resume to Cloudinary (if provided)
 * 3. Send email to employer (if contact email available)
 * 4. Send confirmation email to applicant
 * 5. Return result with emailSent status
 */
router.post('/', async (req, res) => {
    try {
        const {
            deviceToken,
            jobId,
            applicantName,
            applicantEmail,
            applicantPhone,
            coverLetter,
            resumeBase64,
            resumeName,
        } = req.body;

        // Validation
        if (!deviceToken || !jobId) {
            return res.status(400).json({
                success: false,
                error: 'deviceToken and jobId are required',
            });
        }

        if (!applicantEmail) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        // Get job details
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if already applied
        const existing = await Application.findOne({ deviceToken, jobId });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Already applied to this job',
                data: existing,
            });
        }

        // Upload resume to Cloudinary if provided
        let resumeUrl = null;
        if (resumeBase64 && isCloudinaryConfigured()) {
            try {
                const uploadResult = await uploadImage(resumeBase64, {
                    folder: 'safirajobs/resumes',
                    resource_type: 'auto',
                    public_id: `resume_${deviceToken.substring(0, 8)}_${Date.now()}`,
                });
                if (uploadResult.success) {
                    resumeUrl = uploadResult.url;
                }
            } catch (err) {
                console.warn('Resume upload failed:', err.message);
            }
        }

        // Determine employer email
        // Jobs may have contactEmail, or we extract from source
        const employerEmail = job.contactEmail || job.employerEmail || null;

        // Try to send email if employer has email and email service is configured
        let emailSent = false;
        let emailResult = null;

        if (employerEmail && isEmailConfigured()) {
            emailResult = await sendApplicationEmail({
                to: employerEmail,
                applicantName,
                applicantEmail,
                applicantPhone,
                jobTitle: job.title,
                company: job.organization,
                coverLetter,
                resumeUrl,
                resumeName,
            });
            emailSent = emailResult.success;
        } else if (isEmailConfigured() && applicantEmail) {
            // Even if no employer email, send confirmation to applicant
            // They'll need to apply via the external URL
            emailSent = false;
        }

        // Save application to database
        const application = await Application.create({
            deviceToken,
            jobId,
            status: 'applied',
            appliedVia: emailSent ? 'email' : (job.applyUrl ? 'website' : 'in-app'),
            contactEmail: applicantEmail,
            jobSnapshot: {
                title: job.title,
                organization: job.organization,
                location: job.location,
                category: job.category,
            },
            notes: coverLetter ? `Cover Letter: ${coverLetter.substring(0, 200)}` : '',
            applicantEmail,
            applicantPhone,
            resumeUrl,
            coverLetter,
            emailSent,
            emailSentAt: emailSent ? new Date() : null,
        });

        res.status(201).json({
            success: true,
            message: emailSent
                ? 'Application submitted and email sent to employer!'
                : 'Application tracked! Apply on the company website to complete.',
            data: {
                applicationId: application._id,
                emailSent,
                hasApplyUrl: !!job.applyUrl,
                applyUrl: job.applyUrl || null,
                company: job.organization,
                jobTitle: job.title,
            },
        });

    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit application',
        });
    }
});

/**
 * GET /api/apply/status
 * Check apply service status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        email: {
            configured: isEmailConfigured(),
            provider: 'Gmail SMTP',
        },
        cloudinary: {
            configured: isCloudinaryConfigured(),
        },
    });
});

module.exports = router;
