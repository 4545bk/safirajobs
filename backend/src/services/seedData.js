/**
 * Comprehensive seed data for testing - 100+ realistic jobs
 */

const Job = require('../models/Job');

// Real organizations operating in Ethiopia
const organizations = [
    'UNICEF Ethiopia', 'World Health Organization', 'Save the Children',
    'International Rescue Committee', 'World Food Programme', 'UNDP Ethiopia',
    'Oxfam', 'USAID Ethiopia', 'Médecins Sans Frontières', 'UNHCR',
    'Danish Refugee Council', 'Norwegian Refugee Council', 'Action Against Hunger',
    'CARE International', 'Plan International', 'World Vision', 'Mercy Corps',
    'International Medical Corps', 'Catholic Relief Services', 'Islamic Relief',
    'Red Cross Ethiopia', 'Concern Worldwide', 'Goal Ethiopia', 'SOS Children Villages',
    'Handicap International', 'Malteser International', 'Solidarités International',
    'Samaritan Purse', 'Helen Keller International', 'Food for the Hungry',
    // Ethiopian companies
    'Commercial Bank of Ethiopia', 'Ethiopian Airlines', 'Ethio Telecom',
    'Dashen Bank', 'Awash Bank', 'Safaricom Ethiopia', 'Zemen Bank'
];

// Company logo URLs (real logos from official sources or placeholder)
const organizationLogos = {
    'UNICEF Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/200px-Logo_of_UNICEF.svg.png',
    'World Health Organization': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/World_Health_Organization_Logo.svg/200px-World_Health_Organization_Logo.svg.png',
    'Save the Children': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Save_the_children_logo.svg/200px-Save_the_children_logo.svg.png',
    'World Food Programme': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/WFP_logo.svg/200px-WFP_logo.svg.png',
    'UNDP Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/UNDP_logo.svg/200px-UNDP_logo.svg.png',
    'UNHCR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/UNHCR.svg/200px-UNHCR.svg.png',
    'Oxfam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Oxfam_logo.svg/200px-Oxfam_logo.svg.png',
    'CARE International': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/CARE_logo.svg/200px-CARE_logo.svg.png',
    'World Vision': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/World_Vision_logo.svg/200px-World_Vision_logo.svg.png',
    'Red Cross Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_the_Red_Cross.svg/200px-Flag_of_the_Red_Cross.svg.png',
    'Plan International': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Plan_international_logo.svg/200px-Plan_international_logo.svg.png',
    // Ethiopian Companies (using placeholder with initials)
    'Commercial Bank of Ethiopia': 'https://ui-avatars.com/api/?name=CBE&background=0066CC&color=fff&size=200&bold=true',
    'Ethiopian Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Ethiopian_Airlines_Logo.svg/200px-Ethiopian_Airlines_Logo.svg.png',
    'Ethio Telecom': 'https://ui-avatars.com/api/?name=ET&background=FF6B00&color=fff&size=200&bold=true',
    'Dashen Bank': 'https://ui-avatars.com/api/?name=DB&background=003366&color=fff&size=200&bold=true',
    'Awash Bank': 'https://ui-avatars.com/api/?name=AB&background=8B0000&color=fff&size=200&bold=true',
    'Safaricom Ethiopia': 'https://ui-avatars.com/api/?name=SE&background=00A651&color=fff&size=200&bold=true',
    'Zemen Bank': 'https://ui-avatars.com/api/?name=ZB&background=006699&color=fff&size=200&bold=true',
    'International Rescue Committee': 'https://ui-avatars.com/api/?name=IRC&background=FFD700&color=000&size=200&bold=true',
    'Médecins Sans Frontières': 'https://ui-avatars.com/api/?name=MSF&background=DC143C&color=fff&size=200&bold=true',
    'Danish Refugee Council': 'https://ui-avatars.com/api/?name=DRC&background=FF4500&color=fff&size=200&bold=true',
    'Norwegian Refugee Council': 'https://ui-avatars.com/api/?name=NRC&background=FF6347&color=fff&size=200&bold=true',
    'Action Against Hunger': 'https://ui-avatars.com/api/?name=AAH&background=E74C3C&color=fff&size=200&bold=true',
    'Mercy Corps': 'https://ui-avatars.com/api/?name=MC&background=1ABC9C&color=fff&size=200&bold=true',
    'International Medical Corps': 'https://ui-avatars.com/api/?name=IMC&background=3498DB&color=fff&size=200&bold=true',
    'Catholic Relief Services': 'https://ui-avatars.com/api/?name=CRS&background=9B59B6&color=fff&size=200&bold=true',
    'Islamic Relief': 'https://ui-avatars.com/api/?name=IR&background=27AE60&color=fff&size=200&bold=true',
    'Concern Worldwide': 'https://ui-avatars.com/api/?name=CW&background=E67E22&color=fff&size=200&bold=true',
    'Goal Ethiopia': 'https://ui-avatars.com/api/?name=GE&background=2ECC71&color=fff&size=200&bold=true',
    'SOS Children Villages': 'https://ui-avatars.com/api/?name=SOS&background=E74C3C&color=fff&size=200&bold=true',
    'Handicap International': 'https://ui-avatars.com/api/?name=HI&background=3498DB&color=fff&size=200&bold=true',
    'Malteser International': 'https://ui-avatars.com/api/?name=MI&background=DC143C&color=fff&size=200&bold=true',
    'Solidarités International': 'https://ui-avatars.com/api/?name=SI&background=2980B9&color=fff&size=200&bold=true',
    'Samaritan Purse': 'https://ui-avatars.com/api/?name=SP&background=FF4500&color=fff&size=200&bold=true',
    'Helen Keller International': 'https://ui-avatars.com/api/?name=HKI&background=8E44AD&color=fff&size=200&bold=true',
    'Food for the Hungry': 'https://ui-avatars.com/api/?name=FH&background=27AE60&color=fff&size=200&bold=true',
    'USAID Ethiopia': 'https://ui-avatars.com/api/?name=USAID&background=002868&color=fff&size=200&bold=true',
};

// Ethiopian cities
const locations = [
    'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar',
    'Hawassa', 'Adama', 'Jimma', 'Dessie', 'Gambella', 'Jijiga',
    'Harar', 'Sodo', 'Arba Minch', 'Hosaena', 'Debre Birhan', 'Asella'
];

// Job categories
const categories = [
    'Program Management', 'Health', 'Education', 'Monitoring & Evaluation',
    'Logistics/Procurement', 'Finance/Accounting', 'Human Resources',
    'Information Technology', 'Communications', 'Protection', 'WASH',
    'Nutrition', 'Agriculture', 'Livelihoods', 'Coordination',
    'Child Protection', 'Gender', 'Administration'
];

// Experience levels
const experienceLevels = ['Entry', 'Mid', 'Senior', 'Director'];

// Job title templates
const jobTitleTemplates = {
    'Program Management': ['Program Officer', 'Project Manager', 'Program Coordinator', 'Project Officer', 'Program Director'],
    'Health': ['Health Officer', 'Medical Doctor', 'Nurse', 'Public Health Specialist', 'Health Program Manager'],
    'Education': ['Education Officer', 'Teacher Trainer', 'Education Specialist', 'Literacy Coach', 'Education Coordinator'],
    'Monitoring & Evaluation': ['M&E Officer', 'Data Analyst', 'M&E Specialist', 'Research Officer', 'M&E Coordinator'],
    'Logistics/Procurement': ['Logistics Officer', 'Procurement Specialist', 'Supply Chain Manager', 'Fleet Manager', 'Warehouse Officer'],
    'Finance/Accounting': ['Finance Officer', 'Accountant', 'Finance Manager', 'Budget Analyst', 'Finance Coordinator'],
    'Human Resources': ['HR Officer', 'HR Manager', 'Recruitment Specialist', 'HR Coordinator', 'Training Officer'],
    'Information Technology': ['IT Officer', 'Systems Administrator', 'IT Support Technician', 'Database Administrator', 'IT Manager'],
    'Communications': ['Communications Officer', 'Media Relations Specialist', 'Content Creator', 'Advocacy Officer', 'Communications Manager'],
    'Protection': ['Protection Officer', 'Case Manager', 'Psychosocial Counselor', 'Protection Coordinator', 'Legal Officer'],
    'WASH': ['WASH Officer', 'WASH Engineer', 'Hygiene Promoter', 'WASH Specialist', 'WASH Coordinator'],
    'Nutrition': ['Nutrition Officer', 'Nutritionist', 'Nutrition Specialist', 'Community Nutrition Worker', 'Nutrition Coordinator'],
    'Agriculture': ['Agriculture Officer', 'Agronomist', 'Livelihood Officer', 'Agriculture Specialist', 'Food Security Officer'],
    'Livelihoods': ['Livelihoods Officer', 'Economic Recovery Specialist', 'Microfinance Officer', 'Enterprise Development Officer'],
    'Coordination': ['Field Coordinator', 'Area Manager', 'Emergency Coordinator', 'Base Manager', 'Deputy Coordinator'],
    'Child Protection': ['Child Protection Officer', 'Case Worker', 'Child Rights Specialist', 'Child Development Officer'],
    'Gender': ['Gender Officer', 'Women Empowerment Specialist', 'GBV Specialist', 'Gender Coordinator'],
    'Administration': ['Admin Officer', 'Office Manager', 'Receptionist', 'Admin Assistant', 'Facilities Manager']
};

// Generate dynamic job descriptions
const generateDescription = (title, category, organization) => {
    const responsibilities = [
        `Lead ${category.toLowerCase()} activities in assigned area`,
        'Coordinate with local partners and stakeholders',
        'Prepare reports and documentation',
        'Ensure compliance with organizational policies',
        'Monitor and evaluate program activities',
        'Provide capacity building to team members',
        'Manage budget and resources effectively',
        'Represent organization in coordination meetings'
    ];

    const requirements = [
        'Relevant university degree',
        'Minimum 2-5 years of relevant experience',
        'Strong computer skills (MS Office)',
        'Excellent communication skills in English and Amharic',
        'Ability to work in challenging environments',
        'Strong organizational and time management skills'
    ];

    const shuffled = responsibilities.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    return `${organization} is seeking a ${title} to join our team in Ethiopia.

Key Responsibilities:
${selected.map(r => `• ${r}`).join('\n')}

Requirements:
${requirements.slice(0, 4).map(r => `• ${r}`).join('\n')}

This is an excellent opportunity to contribute to meaningful humanitarian work in Ethiopia.`;
};

// Generate sample jobs
const generateSampleJobs = () => {
    const jobs = [];
    let idCounter = 1;

    // Generate jobs for each category
    categories.forEach(category => {
        const titles = jobTitleTemplates[category] || ['Officer', 'Specialist', 'Coordinator'];
        const jobsPerCategory = Math.floor(120 / categories.length); // ~6-7 jobs per category

        for (let i = 0; i < jobsPerCategory; i++) {
            const org = organizations[Math.floor(Math.random() * organizations.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const level = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
            const daysUntilClose = Math.floor(Math.random() * 60) + 5; // 5-65 days
            const daysAgo = Math.floor(Math.random() * 10); // Posted 0-10 days ago

            jobs.push({
                sourceId: `sample-${String(idCounter).padStart(3, '0')}`,
                source: 'sample',
                title: `${title}${level === 'Senior' || level === 'Director' ? ' - ' + level : ''}`,
                organization: org,
                logo: organizationLogos[org] || null,
                location,
                country: 'Ethiopia',
                category,
                experienceLevel: level,
                description: generateDescription(title, category, org),
                applyUrl: `https://jobs.example.com/${idCounter}`,
                postedDate: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)),
                closingDate: new Date(Date.now() + (daysUntilClose * 24 * 60 * 60 * 1000))
            });

            idCounter++;
        }
    });

    return jobs;
};

const sampleJobs = generateSampleJobs();

/**
 * Seed sample jobs into database
 */
const seedJobs = async () => {
    const stats = { inserted: 0, updated: 0, skipped: 0 };

    console.log(`Seeding ${sampleJobs.length} sample jobs...`);

    for (const job of sampleJobs) {
        try {
            const existing = await Job.findOne({ sourceId: job.sourceId });

            await Job.findOneAndUpdate(
                { sourceId: job.sourceId },
                job,
                { upsert: true, new: true }
            );

            if (existing) {
                stats.updated++;
            } else {
                stats.inserted++;
            }
        } catch (error) {
            console.error(`Error seeding job ${job.sourceId}:`, error.message);
            stats.skipped++;
        }
    }

    console.log('Seed complete:', stats);
    return stats;
};

/**
 * Clear sample jobs
 */
const clearSampleJobs = async () => {
    const result = await Job.deleteMany({
        sourceId: { $regex: /^sample-/ }
    });
    console.log(`Cleared ${result.deletedCount} sample jobs`);
    return result.deletedCount;
};

module.exports = { seedJobs, clearSampleJobs, sampleJobs };
