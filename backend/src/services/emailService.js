/**
 * Email Service - Send job application emails
 * Uses Nodemailer with Gmail SMTP (free)
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    // Check if email is configured
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.warn('Email service not configured. Set SMTP_EMAIL and SMTP_PASSWORD in .env');
        return null;
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD, // Gmail App Password
        },
    });

    return transporter;
};

/**
 * Send job application email to employer
 * @param {object} options
 * @param {string} options.to - Employer email
 * @param {string} options.applicantName - Applicant name
 * @param {string} options.applicantEmail - Applicant email
 * @param {string} options.applicantPhone - Applicant phone
 * @param {string} options.jobTitle - Job title
 * @param {string} options.company - Company name
 * @param {string} options.coverLetter - Cover letter text
 * @param {string} options.resumeUrl - Cloudinary URL of resume
 * @param {string} options.resumeName - Original filename
 */
const sendApplicationEmail = async (options) => {
    const transport = getTransporter();
    if (!transport) {
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const {
            to,
            applicantName,
            applicantEmail,
            applicantPhone,
            jobTitle,
            company,
            coverLetter,
            resumeUrl,
            resumeName,
        } = options;

        // Build email HTML
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 30px 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }
        .body { padding: 24px; }
        .info-card { background: #f8fffe; border: 1px solid #d1fae5; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
        .info-row { display: flex; margin-bottom: 10px; }
        .info-label { font-weight: 600; color: #374151; width: 100px; font-size: 14px; }
        .info-value { color: #6b7280; font-size: 14px; }
        .cover-letter { background: #f9fafb; border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
        .cover-letter h3 { margin: 0 0 10px; color: #374151; font-size: 15px; }
        .cover-letter p { color: #6b7280; line-height: 1.6; margin: 0; font-size: 14px; white-space: pre-wrap; }
        .resume-link { display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
        .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 New Job Application</h1>
            <p>Application for <strong>${jobTitle}</strong></p>
        </div>
        
        <div class="body">
            <p style="color: #374151; margin-bottom: 20px;">
                Hello ${company} Hiring Team,
            </p>
            <p style="color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
                A candidate has applied for the <strong>${jobTitle}</strong> position through SafiraJobs.
            </p>
            
            <div class="info-card">
                <h3 style="margin: 0 0 12px; color: #059669; font-size: 15px;">👤 Applicant Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151; width: 100px; font-size: 14px;">Name:</td>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">${applicantName || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151; font-size: 14px;">Email:</td>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;"><a href="mailto:${applicantEmail}" style="color: #10B981;">${applicantEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151; font-size: 14px;">Phone:</td>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">${applicantPhone || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151; font-size: 14px;">Position:</td>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">${jobTitle}</td>
                    </tr>
                </table>
            </div>
            
            ${coverLetter ? `
            <div class="cover-letter">
                <h3>📝 Cover Letter</h3>
                <p>${coverLetter}</p>
            </div>
            ` : ''}
            
            ${resumeUrl ? `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${resumeUrl}" class="resume-link" target="_blank">
                    📄 Download Resume${resumeName ? ` (${resumeName})` : ''}
                </a>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Sent via <strong>SafiraJobs</strong> — Ethiopia's Smart Job Platform</p>
            <p style="margin-top: 8px;">
                <span class="badge">✓ Verified Application</span>
            </p>
        </div>
    </div>
</body>
</html>
        `;

        // Also send confirmation to applicant
        const applicantHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 30px 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .body { padding: 24px; }
        .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Application Submitted!</h1>
        </div>
        <div class="body">
            <p style="color: #374151;">Hi ${applicantName || 'there'},</p>
            <p style="color: #6b7280; line-height: 1.6;">
                Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been successfully submitted through SafiraJobs.
            </p>
            <div style="background: #ecfdf5; border-radius: 10px; padding: 16px; margin: 20px 0;">
                <p style="color: #059669; margin: 0; font-weight: 600;">📋 Application Details</p>
                <p style="color: #6b7280; margin: 8px 0 0;">Position: ${jobTitle}</p>
                <p style="color: #6b7280; margin: 4px 0 0;">Company: ${company}</p>
                <p style="color: #6b7280; margin: 4px 0 0;">Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <p style="color: #6b7280; line-height: 1.6;">
                The employer will review your application and contact you directly. Keep checking your email and SafiraJobs app for updates!
            </p>
            <p style="color: #6b7280;">Good luck! 🍀</p>
        </div>
        <div class="footer">
            <p><strong>SafiraJobs</strong> — Ethiopia's Smart Job Platform</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send to employer
        const employerResult = await transport.sendMail({
            from: `"SafiraJobs Applications" <${process.env.SMTP_EMAIL}>`,
            to: to,
            replyTo: applicantEmail,
            subject: `📋 New Application: ${jobTitle} — ${applicantName || applicantEmail}`,
            html: html,
        });

        // Send confirmation to applicant
        if (applicantEmail) {
            await transport.sendMail({
                from: `"SafiraJobs" <${process.env.SMTP_EMAIL}>`,
                to: applicantEmail,
                subject: `✅ Application Submitted: ${jobTitle} at ${company}`,
                html: applicantHtml,
            }).catch(err => console.warn('Failed to send applicant confirmation:', err.message));
        }

        console.log('Application email sent:', employerResult.messageId);
        return {
            success: true,
            messageId: employerResult.messageId,
        };
    } catch (error) {
        console.error('Email send error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Check if email service is configured
 */
const isEmailConfigured = () => {
    return !!(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);
};

/**
 * Verify email service connection
 */
const verifyConnection = async () => {
    const transport = getTransporter();
    if (!transport) return { success: false, error: 'Not configured' };

    try {
        await transport.verify();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendApplicationEmail,
    isEmailConfigured,
    verifyConnection,
};
