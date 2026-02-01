/**
 * Seed sample job data for testing
 */

const Job = require('../models/Job');

const sampleJobs = [
    {
        sourceId: 'sample-001',
        title: 'Program Officer - Humanitarian Response',
        organization: 'UNICEF Ethiopia',
        location: 'Addis Ababa',
        country: 'Ethiopia',
        category: 'Program Management',
        experienceLevel: 'Mid',
        description: 'UNICEF is seeking a Program Officer to support humanitarian response programs in Ethiopia. The ideal candidate will have experience in emergency response and program coordination.',
        applyUrl: 'https://unicef.org/careers/sample-001',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
        sourceId: 'sample-002',
        title: 'Health & Nutrition Specialist',
        organization: 'World Health Organization',
        location: 'Addis Ababa',
        country: 'Ethiopia',
        category: 'Health',
        experienceLevel: 'Senior',
        description: 'WHO Ethiopia is looking for a Health & Nutrition Specialist to lead nutrition programs across the country.',
        applyUrl: 'https://who.int/careers/sample-002',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
        sourceId: 'sample-003',
        title: 'Field Coordinator',
        organization: 'International Rescue Committee',
        location: 'Gambella',
        country: 'Ethiopia',
        category: 'Coordination',
        experienceLevel: 'Mid',
        description: 'IRC seeks a Field Coordinator to manage field operations in Gambella region.',
        applyUrl: 'https://rescue.org/careers/sample-003',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
    {
        sourceId: 'sample-004',
        title: 'Data Analyst - M&E',
        organization: 'Save the Children',
        location: 'Addis Ababa',
        country: 'Ethiopia',
        category: 'Monitoring & Evaluation',
        experienceLevel: 'Entry',
        description: 'Save the Children is hiring a Data Analyst to support monitoring and evaluation activities.',
        applyUrl: 'https://savethechildren.org/careers/sample-004',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
        sourceId: 'sample-005',
        title: 'Logistics Officer',
        organization: 'World Food Programme',
        location: 'Dire Dawa',
        country: 'Ethiopia',
        category: 'Logistics/Procurement',
        experienceLevel: 'Mid',
        description: 'WFP is recruiting a Logistics Officer to manage supply chain operations.',
        applyUrl: 'https://wfp.org/careers/sample-005',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    },
    {
        sourceId: 'sample-006',
        title: 'Communications Associate',
        organization: 'UNDP Ethiopia',
        location: 'Addis Ababa',
        country: 'Ethiopia',
        category: 'Communications',
        experienceLevel: 'Entry',
        description: 'UNDP seeks a Communications Associate to support public outreach activities.',
        applyUrl: 'https://undp.org/careers/sample-006',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
        sourceId: 'sample-007',
        title: 'Finance Manager',
        organization: 'Oxfam',
        location: 'Addis Ababa',
        country: 'Ethiopia',
        category: 'Finance/Accounting',
        experienceLevel: 'Senior',
        description: 'Oxfam Ethiopia is looking for a Finance Manager to oversee financial operations.',
        applyUrl: 'https://oxfam.org/careers/sample-007',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    },
    {
        sourceId: 'sample-008',
        title: 'IT Support Technician',
        organization: 'USAID Ethiopia',
        location: 'Addis Ababa',
        country: 'Ethiopia',
        category: 'Information Technology',
        experienceLevel: 'Entry',
        description: 'USAID is hiring an IT Support Technician for their Addis Ababa office.',
        applyUrl: 'https://usaid.gov/careers/sample-008',
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
];

/**
 * Seed sample jobs into database
 */
const seedJobs = async () => {
    const stats = { inserted: 0, skipped: 0 };

    for (const job of sampleJobs) {
        try {
            await Job.findOneAndUpdate(
                { sourceId: job.sourceId },
                job,
                { upsert: true, new: true }
            );
            stats.inserted++;
        } catch (error) {
            stats.skipped++;
        }
    }

    return stats;
};

/**
 * Clear sample jobs
 */
const clearSampleJobs = async () => {
    const result = await Job.deleteMany({
        sourceId: { $regex: /^sample-/ }
    });
    return result.deletedCount;
};

module.exports = { seedJobs, clearSampleJobs, sampleJobs };
