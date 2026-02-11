/**
 * CV Routes
 * Handles CV PDF generation endpoints
 */

const express = require('express');
const router = express.Router();
const pdfGenerator = require('../services/pdfGenerator');

/**
 * GET /api/cv/templates
 * List available CV templates
 */
router.get('/templates', (req, res) => {
    try {
        const templates = pdfGenerator.getTemplateList();
        res.json({
            success: true,
            templates,
        });
    } catch (error) {
        console.error('Error listing templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list templates',
        });
    }
});

/**
 * POST /api/cv/generate
 * Generate PDF from CV data
 * 
 * Request body:
 * {
 *   template: "classic" | "modern" | "graduate",
 *   cvData: { personalInfo, professionalSummary, education, experience, skills, languages }
 * }
 */
router.post('/generate', async (req, res) => {
    try {
        const { template = 'classic', cvData } = req.body;

        // Validate request
        if (!cvData) {
            return res.status(400).json({
                success: false,
                error: 'CV data is required',
            });
        }

        if (!cvData.personalInfo) {
            return res.status(400).json({
                success: false,
                error: 'Personal information is required',
            });
        }

        const { firstName, lastName, email } = cvData.personalInfo;
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                error: 'First name, last name, and email are required',
            });
        }

        // Validate template
        const validTemplates = [
            'classic-teal', 'modern-amber', 'professional-navy', 'clean-minimal',
            'elegant-gray', 'creative-split', 'minimal-red', 'modern-sections',
            'pink-creative', 'teal-sidebar', 'blue-header',
            // Legacy support
            'classic', 'modern', 'graduate'
        ];
        if (!validTemplates.includes(template)) {
            return res.status(400).json({
                success: false,
                error: `Invalid template. Must be one of: ${validTemplates.join(', ')}`,
            });
        }

        console.log(`📄 Generating CV PDF for ${firstName} ${lastName} using ${template} template`);

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generatePDF(cvData, template);

        // Create filename
        const filename = `${firstName}_${lastName}_CV.pdf`
            .replace(/[^a-zA-Z0-9_.-]/g, '_');

        // Send PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);

        console.log(`✅ CV PDF generated successfully: ${filename}`);

    } catch (error) {
        console.error('Error generating CV PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate PDF',
            message: error.message,
        });
    }
});

/**
 * POST /api/cv/preview
 * Generate HTML preview (for testing)
 */
router.post('/preview', async (req, res) => {
    try {
        const { template = 'classic', cvData } = req.body;

        if (!cvData) {
            return res.status(400).json({
                success: false,
                error: 'CV data is required',
            });
        }

        // Initialize generator if needed
        if (!pdfGenerator.initialized) {
            await pdfGenerator.init();
        }

        // Get template
        const Handlebars = require('handlebars');
        const templateHtml = pdfGenerator.templates[template];

        if (!templateHtml) {
            return res.status(400).json({
                success: false,
                error: 'Invalid template',
            });
        }

        // Compile and render
        const compiledTemplate = Handlebars.compile(templateHtml);
        const html = compiledTemplate(cvData);

        // Return HTML
        res.set('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('Error generating preview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate preview',
        });
    }
});

/**
 * GET /api/cv/sample
 * Get sample CV data for testing
 */
router.get('/sample', (req, res) => {
    const sampleCV = {
        personalInfo: {
            firstName: 'Biruh',
            lastName: 'Tesfaye',
            email: 'biruh.tesfaye@email.com',
            phone: '+251912345678',
            city: 'Addis Ababa',
            country: 'Ethiopia',
            linkedIn: 'linkedin.com/in/biruhtesfaye',
        },
        professionalSummary: {
            text: 'Results-driven Project Manager with 7+ years of experience in humanitarian response and development programs. Proven track record in managing multi-million dollar USAID and EU-funded projects. Expert in MEAL frameworks, stakeholder coordination, and team leadership.',
        },
        education: [
            {
                degree: 'Master of Public Health',
                fieldOfStudy: 'Health Systems Management',
                institution: 'Addis Ababa University',
                startDate: { month: 9, year: 2018 },
                endDate: { month: 7, year: 2020 },
                isCurrently: false,
                gpa: '3.8/4.0',
                achievements: 'Graduated with Distinction',
            },
            {
                degree: 'Bachelor of Science',
                fieldOfStudy: 'Public Health',
                institution: 'Jimma University',
                startDate: { month: 9, year: 2014 },
                endDate: { month: 7, year: 2018 },
                isCurrently: false,
            },
        ],
        experience: [
            {
                jobTitle: 'Project Manager',
                organization: 'Save the Children International',
                location: { city: 'Addis Ababa' },
                startDate: { month: 3, year: 2021 },
                endDate: null,
                isCurrently: true,
                responsibilities: [
                    'Lead implementation of $2.5M USAID-funded child protection program across 4 regions',
                    'Manage team of 15 staff and coordinate with 8 government partners',
                    'Develop and monitor project workplans, budgets, and MEAL frameworks',
                    'Prepare quarterly donor reports with 100% compliance',
                ],
            },
            {
                jobTitle: 'M&E Officer',
                organization: 'UNICEF Ethiopia',
                location: { city: 'Addis Ababa' },
                startDate: { month: 6, year: 2018 },
                endDate: { month: 2, year: 2021 },
                isCurrently: false,
                responsibilities: [
                    'Designed M&E systems for WASH and nutrition programs',
                    'Conducted baseline and endline surveys using Kobo Toolbox',
                    'Trained 50+ field staff on data collection and quality assurance',
                    'Produced monthly dashboards and analytical reports',
                ],
            },
        ],
        skills: {
            technical: [
                { name: 'Project Cycle Management', level: 'expert' },
                { name: 'MEAL/M&E', level: 'expert' },
                { name: 'Proposal Writing', level: 'advanced' },
                { name: 'Budget Management', level: 'advanced' },
            ],
            software: [
                { name: 'Microsoft Office Suite', level: 'expert' },
                { name: 'Kobo Toolbox', level: 'expert' },
                { name: 'SPSS', level: 'advanced' },
                { name: 'Power BI', level: 'intermediate' },
            ],
            soft: [
                { name: 'Team Leadership' },
                { name: 'Cross-cultural Communication' },
                { name: 'Problem Solving' },
            ],
        },
        languages: [
            { name: 'Amharic', proficiency: 'native' },
            { name: 'English', proficiency: 'fluent' },
            { name: 'Oromiffa', proficiency: 'intermediate' },
        ],
    };

    res.json({
        success: true,
        sampleCV,
        usage: {
            generate: 'POST /api/cv/generate with { template: "classic", cvData: sampleCV }',
            preview: 'POST /api/cv/preview with { template: "classic", cvData: sampleCV }',
        },
    });
});

module.exports = router;
