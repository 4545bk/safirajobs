/**
 * CV PDF Generator Service
 * Converts CV data to PDF using Puppeteer and Handlebars
 */

const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');

class PDFGenerator {
  constructor() {
    this.browser = null;
    this.templates = {};
    this.initialized = false;
  }

  /**
   * Initialize the PDF generator
   * - Launch Puppeteer browser
   * - Load and compile templates
   */
  async init() {
    if (this.initialized) return;

    console.log('🖨️ Initializing PDF Generator...');

    // Launch Puppeteer browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    // Register Handlebars helpers
    this.registerHelpers();

    // Load templates
    this.loadTemplates();

    this.initialized = true;
    console.log('✅ PDF Generator ready');
  }

  /**
   * Register Handlebars helpers for formatting
   */
  registerHelpers() {
    // Format date as "Mar 2021"
    Handlebars.registerHelper('formatDate', (dateObj) => {
      if (!dateObj) return '';
      if (dateObj.month && dateObj.year) {
        return dayjs()
          .month(dateObj.month - 1)
          .year(dateObj.year)
          .format('MMM YYYY');
      }
      return dateObj;
    });

    // Date range helper
    Handlebars.registerHelper('dateRange', (start, end, isCurrent) => {
      const startStr = start
        ? dayjs().month(start.month - 1).year(start.year).format('MMM YYYY')
        : '';

      if (isCurrent) {
        return `${startStr} – Present`;
      }

      const endStr = end
        ? dayjs().month(end.month - 1).year(end.year).format('MMM YYYY')
        : '';

      return `${startStr} – ${endStr}`;
    });

    // Skill level dots
    Handlebars.registerHelper('skillDots', (level) => {
      const levels = { expert: 5, advanced: 4, intermediate: 3, beginner: 2 };
      const filled = levels[level] || 3;
      const empty = 5 - filled;
      return '●'.repeat(filled) + '○'.repeat(empty);
    });

    // Check if array has items
    Handlebars.registerHelper('hasItems', (arr) => {
      return arr && arr.length > 0;
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function (a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });
  }

  /**
   * Load HTML templates
   */
  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/cv');

    // NGO Classic template
    this.templates.classic = this.getClassicTemplate();

    // Modern Clean template
    this.templates.modern = this.getModernTemplate();

    // Entry-Level Graduate template
    this.templates.graduate = this.getGraduateTemplate();

    // Lovable template mappings (use classic as base for now)
    this.templates['classic-teal'] = this.getClassicTemplate();
    this.templates['modern-amber'] = this.getModernTemplate();
    this.templates['professional-navy'] = this.getClassicTemplate();
    this.templates['clean-minimal'] = this.getModernTemplate();
    this.templates['elegant-gray'] = this.getClassicTemplate();
    this.templates['creative-split'] = this.getClassicTemplate();
    this.templates['minimal-red'] = this.getModernTemplate();
    this.templates['modern-sections'] = this.getModernTemplate();
    this.templates['pink-creative'] = this.getClassicTemplate();
    this.templates['teal-sidebar'] = this.getClassicTemplate();
    this.templates['blue-header'] = this.getModernTemplate();
  }

  /**
   * NGO Classic Template - Traditional professional format
   */
  getClassicTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #374151;
      background: white;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 20pt;
      padding-bottom: 15pt;
      border-bottom: 2pt solid #1A56DB;
    }
    
    .name {
      font-size: 24pt;
      font-weight: bold;
      color: #1F2937;
      margin-bottom: 5pt;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .tagline {
      font-size: 12pt;
      color: #6B7280;
      margin-bottom: 10pt;
    }
    
    .contact {
      font-size: 10pt;
      color: #374151;
    }
    
    .contact span {
      margin: 0 10pt;
    }
    
    /* Sections */
    .section {
      margin-bottom: 18pt;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1F2937;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10pt;
      padding-bottom: 4pt;
      border-bottom: 1pt solid #E5E7EB;
    }
    
    /* Summary */
    .summary-text {
      font-size: 10pt;
      line-height: 1.5;
      color: #374151;
    }
    
    /* Experience */
    .entry {
      margin-bottom: 14pt;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4pt;
    }
    
    .entry-title {
      font-size: 11pt;
      font-weight: 600;
      color: #1F2937;
    }
    
    .entry-date {
      font-size: 10pt;
      color: #6B7280;
    }
    
    .entry-org {
      font-size: 10pt;
      color: #1A56DB;
      margin-bottom: 6pt;
    }
    
    .entry-location {
      color: #6B7280;
    }
    
    .entry-list {
      padding-left: 18pt;
    }
    
    .entry-list li {
      margin-bottom: 3pt;
      color: #374151;
    }
    
    /* Education */
    .edu-entry {
      margin-bottom: 10pt;
    }
    
    .edu-degree {
      font-weight: 600;
      color: #1F2937;
    }
    
    .edu-school {
      color: #374151;
    }
    
    .edu-date {
      color: #6B7280;
      font-size: 9pt;
    }
    
    /* Skills */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8pt;
    }
    
    .skill-item {
      background: #F3F4F6;
      padding: 4pt 10pt;
      border-radius: 4pt;
      font-size: 9pt;
      color: #374151;
    }
    
    /* Languages */
    .languages-list {
      display: flex;
      gap: 20pt;
    }
    
    .lang-item {
      font-size: 10pt;
    }
    
    .lang-name {
      font-weight: 500;
      color: #1F2937;
    }
    
    .lang-level {
      color: #6B7280;
      font-size: 9pt;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <!-- Header -->
    <header class="header">
      <h1 class="name">{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
      <p class="tagline">{{personalInfo.city}}, {{personalInfo.country}}</p>
      <div class="contact">
        <span>📧 {{personalInfo.email}}</span>
        <span>📱 {{personalInfo.phone}}</span>
        {{#if personalInfo.linkedIn}}
        <span>🔗 {{personalInfo.linkedIn}}</span>
        {{/if}}
      </div>
    </header>
    
    <!-- Professional Summary -->
    {{#if professionalSummary.text}}
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">{{professionalSummary.text}}</p>
    </section>
    {{/if}}
    
    <!-- Experience -->
    {{#if (hasItems experience)}}
    <section class="section">
      <h2 class="section-title">Professional Experience</h2>
      {{#each experience}}
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">{{this.jobTitle}}</span>
          <span class="entry-date">{{dateRange this.startDate this.endDate this.isCurrently}}</span>
        </div>
        <p class="entry-org">{{this.organization}} <span class="entry-location">• {{this.location.city}}</span></p>
        {{#if (hasItems this.responsibilities)}}
        <ul class="entry-list">
          {{#each this.responsibilities}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
        {{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}
    
    <!-- Education -->
    {{#if (hasItems education)}}
    <section class="section">
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <div class="edu-entry">
        <span class="edu-degree">{{this.degree}}</span>
        {{#if this.fieldOfStudy}}
        <span> in {{this.fieldOfStudy}}</span>
        {{/if}}
        <br>
        <span class="edu-school">{{this.institution}}</span>
        <span class="edu-date"> • {{this.startDate.year}} – {{#if this.isCurrently}}Present{{else}}{{this.endDate.year}}{{/if}}</span>
      </div>
      {{/each}}
    </section>
    {{/if}}
    
    <!-- Skills -->
    {{#if skills}}
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-list">
        {{#each skills.technical}}
        <span class="skill-item">{{this.name}}</span>
        {{/each}}
        {{#each skills.software}}
        <span class="skill-item">{{this.name}}</span>
        {{/each}}
        {{#each skills.soft}}
        <span class="skill-item">{{this.name}}</span>
        {{/each}}
      </div>
    </section>
    {{/if}}
    
    <!-- Languages -->
    {{#if (hasItems languages)}}
    <section class="section">
      <h2 class="section-title">Languages</h2>
      <div class="languages-list">
        {{#each languages}}
        <div class="lang-item">
          <span class="lang-name">{{this.name}}</span>
          <span class="lang-level">({{this.proficiency}})</span>
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}
  </div>
</body>
</html>
    `;
  }

  /**
   * Modern Clean Template - Contemporary design
   */
  getModernTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #334155;
      background: white;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }
    
    .header {
      margin-bottom: 24pt;
    }
    
    .name {
      font-size: 22pt;
      font-weight: 300;
      color: #0F172A;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 8pt;
    }
    
    .title {
      font-size: 13pt;
      font-weight: 500;
      color: #1A56DB;
      margin-bottom: 4pt;
    }
    
    .location {
      font-size: 11pt;
      color: #64748B;
      margin-bottom: 12pt;
    }
    
    .contact-stack {
      font-size: 10pt;
      color: #334155;
      line-height: 1.6;
    }
    
    .divider {
      height: 1pt;
      background: #E2E8F0;
      margin: 20pt 0;
    }
    
    .section-title {
      font-size: 11pt;
      font-weight: 600;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12pt;
    }
    
    .about-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #334155;
    }
    
    .exp-entry {
      margin-bottom: 16pt;
    }
    
    .exp-title {
      font-size: 11pt;
      font-weight: 600;
      color: #0F172A;
      text-transform: uppercase;
    }
    
    .exp-org {
      font-size: 11pt;
      font-weight: 500;
      color: #1A56DB;
    }
    
    .exp-date {
      font-size: 10pt;
      color: #64748B;
      margin-bottom: 6pt;
    }
    
    .exp-desc {
      font-size: 10pt;
      color: #334155;
      line-height: 1.5;
    }
    
    .skill-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6pt 0;
      border-bottom: 1pt solid #F1F5F9;
    }
    
    .skill-name {
      font-size: 10pt;
      color: #334155;
    }
    
    .skill-dots {
      font-size: 10pt;
      color: #1A56DB;
      letter-spacing: 2px;
    }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <header class="header">
      <h1 class="name">{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
      <p class="location">{{personalInfo.city}}, {{personalInfo.country}}</p>
      <div class="contact-stack">
        {{personalInfo.email}}<br>
        {{personalInfo.phone}}
        {{#if personalInfo.linkedIn}}<br>{{personalInfo.linkedIn}}{{/if}}
      </div>
    </header>
    
    <div class="divider"></div>
    
    {{#if professionalSummary.text}}
    <section>
      <h2 class="section-title">About Me</h2>
      <p class="about-text">{{professionalSummary.text}}</p>
    </section>
    <div class="divider"></div>
    {{/if}}
    
    {{#if (hasItems experience)}}
    <section>
      <h2 class="section-title">Experience</h2>
      {{#each experience}}
      <div class="exp-entry">
        <p class="exp-title">{{this.jobTitle}}</p>
        <p class="exp-org">{{this.organization}}</p>
        <p class="exp-date">{{dateRange this.startDate this.endDate this.isCurrently}}</p>
        {{#each this.responsibilities}}
        <p class="exp-desc">{{this}}</p>
        {{/each}}
      </div>
      {{/each}}
    </section>
    <div class="divider"></div>
    {{/if}}
    
    {{#if (hasItems education)}}
    <section>
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <div class="exp-entry">
        <p class="exp-title">{{this.degree}}</p>
        <p class="exp-org">{{this.institution}}</p>
        <p class="exp-date">{{this.startDate.year}} → {{#if this.isCurrently}}Present{{else}}{{this.endDate.year}}{{/if}}</p>
      </div>
      {{/each}}
    </section>
    <div class="divider"></div>
    {{/if}}
    
    {{#if skills}}
    <section>
      <h2 class="section-title">Skills</h2>
      {{#each skills.technical}}
      <div class="skill-row">
        <span class="skill-name">{{this.name}}</span>
        <span class="skill-dots">{{skillDots this.level}}</span>
      </div>
      {{/each}}
      {{#each skills.software}}
      <div class="skill-row">
        <span class="skill-name">{{this.name}}</span>
        <span class="skill-dots">{{skillDots this.level}}</span>
      </div>
      {{/each}}
    </section>
    <div class="divider"></div>
    {{/if}}
    
    {{#if (hasItems languages)}}
    <section>
      <h2 class="section-title">Languages</h2>
      {{#each languages}}
      <div class="skill-row">
        <span class="skill-name">{{this.name}}</span>
        <span class="skill-dots">{{skillDots this.proficiency}}</span>
      </div>
      {{/each}}
    </section>
    {{/if}}
  </div>
</body>
</html>
    `;
  }

  /**
   * Entry-Level Graduate Template
   */
  getGraduateTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Roboto', 'Helvetica Neue', sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #374151;
      background: white;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20pt;
      padding-bottom: 15pt;
      border-bottom: 2pt solid #111827;
    }
    
    .name {
      font-size: 22pt;
      font-weight: bold;
      color: #111827;
      margin-bottom: 4pt;
    }
    
    .tagline {
      font-size: 12pt;
      font-weight: 500;
      color: #4B5563;
      margin-bottom: 10pt;
    }
    
    .contact-line {
      font-size: 10pt;
      color: #374151;
    }
    
    .section {
      margin-bottom: 16pt;
    }
    
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #111827;
      text-transform: uppercase;
      margin-bottom: 8pt;
      padding-bottom: 4pt;
      border-bottom: 1pt solid #E5E7EB;
    }
    
    .objective {
      font-size: 10pt;
      line-height: 1.5;
      color: #374151;
      font-style: italic;
    }
    
    .edu-entry {
      margin-bottom: 12pt;
    }
    
    .edu-degree {
      font-size: 11pt;
      font-weight: 600;
      color: #1F2937;
    }
    
    .edu-school {
      font-size: 10pt;
      color: #374151;
    }
    
    .edu-details {
      font-size: 9pt;
      color: #6B7280;
      margin-top: 4pt;
    }
    
    .exp-entry {
      margin-bottom: 12pt;
    }
    
    .exp-title {
      font-size: 11pt;
      font-weight: 600;
      color: #1F2937;
    }
    
    .exp-org {
      font-size: 10pt;
      color: #374151;
    }
    
    .exp-date {
      font-size: 9pt;
      color: #6B7280;
    }
    
    .exp-list {
      padding-left: 18pt;
      margin-top: 4pt;
    }
    
    .exp-list li {
      font-size: 10pt;
      margin-bottom: 2pt;
    }
    
    .skills-group {
      margin-bottom: 8pt;
    }
    
    .skills-label {
      font-size: 10pt;
      font-weight: 500;
      color: #4B5563;
      margin-bottom: 4pt;
    }
    
    .skills-text {
      font-size: 10pt;
      color: #374151;
    }
    
    .lang-list {
      font-size: 10pt;
      color: #374151;
    }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <header class="header">
      <h1 class="name">{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
      <p class="tagline">Recent Graduate</p>
      <p class="contact-line">
        📧 {{personalInfo.email}} | 📱 {{personalInfo.phone}} | 📍 {{personalInfo.city}}, {{personalInfo.country}}
      </p>
    </header>
    
    {{#if professionalSummary.text}}
    <section class="section">
      <h2 class="section-title">Career Objective</h2>
      <p class="objective">{{professionalSummary.text}}</p>
    </section>
    {{/if}}
    
    {{#if (hasItems education)}}
    <section class="section">
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <div class="edu-entry">
        <p class="edu-degree">{{this.degree}}{{#if this.fieldOfStudy}} in {{this.fieldOfStudy}}{{/if}}</p>
        <p class="edu-school">{{this.institution}}</p>
        <p class="edu-details">
          {{this.startDate.year}} – {{#if this.isCurrently}}Present{{else}}{{this.endDate.year}}{{/if}}
          {{#if this.gpa}} | GPA: {{this.gpa}}{{/if}}
        </p>
        {{#if this.achievements}}
        <p class="edu-details">{{this.achievements}}</p>
        {{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}
    
    {{#if (hasItems experience)}}
    <section class="section">
      <h2 class="section-title">Internships & Experience</h2>
      {{#each experience}}
      <div class="exp-entry">
        <p class="exp-title">{{this.jobTitle}}</p>
        <p class="exp-org">{{this.organization}}</p>
        <p class="exp-date">{{dateRange this.startDate this.endDate this.isCurrently}}</p>
        {{#if (hasItems this.responsibilities)}}
        <ul class="exp-list">
          {{#each this.responsibilities}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
        {{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}
    
    {{#if skills}}
    <section class="section">
      <h2 class="section-title">Skills</h2>
      {{#if (hasItems skills.technical)}}
      <div class="skills-group">
        <p class="skills-label">Technical:</p>
        <p class="skills-text">{{#each skills.technical}}{{this.name}}{{#unless @last}} • {{/unless}}{{/each}}</p>
      </div>
      {{/if}}
      {{#if (hasItems skills.software)}}
      <div class="skills-group">
        <p class="skills-label">Software:</p>
        <p class="skills-text">{{#each skills.software}}{{this.name}}{{#unless @last}} • {{/unless}}{{/each}}</p>
      </div>
      {{/if}}
      {{#if (hasItems skills.soft)}}
      <div class="skills-group">
        <p class="skills-label">Soft Skills:</p>
        <p class="skills-text">{{#each skills.soft}}{{this.name}}{{#unless @last}} • {{/unless}}{{/each}}</p>
      </div>
      {{/if}}
    </section>
    {{/if}}
    
    {{#if (hasItems languages)}}
    <section class="section">
      <h2 class="section-title">Languages</h2>
      <p class="lang-list">
        {{#each languages}}{{this.name}} ({{this.proficiency}}){{#unless @last}} • {{/unless}}{{/each}}
      </p>
    </section>
    {{/if}}
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate PDF from CV data
   * @param {Object} cvData - CV data object
   * @param {string} templateId - Template ID (classic, modern, graduate)
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generatePDF(cvData, templateId = 'classic') {
    // Ensure initialized
    if (!this.initialized) {
      await this.init();
    }

    // Get template
    const templateHtml = this.templates[templateId];
    if (!templateHtml) {
      throw new Error(`Template "${templateId}" not found`);
    }

    // Compile template
    const template = Handlebars.compile(templateHtml);

    // Render HTML with data
    const html = template(cvData);

    // Generate PDF
    const page = await this.browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        printBackground: true,
        preferCSSPageSize: true,
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  /**
   * Get list of available templates
   */
  getTemplateList() {
    return [
      { id: 'classic-teal', name: 'Classic Teal', description: 'Teal sidebar with curved accents' },
      { id: 'modern-amber', name: 'Modern Amber', description: 'Dark sidebar with amber highlights' },
      { id: 'professional-navy', name: 'Professional Navy', description: 'Navy blue with timeline layout' },
      { id: 'clean-minimal', name: 'Clean Minimal', description: 'Simple white ATS-friendly layout' },
      { id: 'elegant-gray', name: 'Elegant Gray', description: 'Sophisticated gray sidebar' },
      { id: 'creative-split', name: 'Creative Split', description: 'Navy split with circular charts' },
      { id: 'minimal-red', name: 'Minimal Red', description: 'Clean layout with red accents' },
      { id: 'modern-sections', name: 'Modern Sections', description: 'Gray section backgrounds' },
      { id: 'pink-creative', name: 'Pink Creative', description: 'Pink diagonal accents' },
      { id: 'teal-sidebar', name: 'Teal Sidebar', description: 'Left sidebar with teal color' },
      { id: 'blue-header', name: 'Blue Header', description: 'Blue header with sidebar' },
    ];
  }

  /**
   * Cleanup - close browser
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.initialized = false;
    }
  }
}

// Singleton instance
const pdfGenerator = new PDFGenerator();

module.exports = pdfGenerator;
