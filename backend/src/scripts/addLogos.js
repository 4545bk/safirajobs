/**
 * Migration script to add logo URLs to existing jobs
 * Run with: node src/scripts/addLogos.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');

// Company logo URLs mapping
const organizationLogos = {
    'UNICEF Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/200px-Logo_of_UNICEF.svg.png',
    'UNICEF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/200px-Logo_of_UNICEF.svg.png',
    'World Health Organization': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/World_Health_Organization_Logo.svg/200px-World_Health_Organization_Logo.svg.png',
    'WHO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/World_Health_Organization_Logo.svg/200px-World_Health_Organization_Logo.svg.png',
    'Save the Children': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Save_the_children_logo.svg/200px-Save_the_children_logo.svg.png',
    'World Food Programme': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/WFP_logo.svg/200px-WFP_logo.svg.png',
    'WFP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/WFP_logo.svg/200px-WFP_logo.svg.png',
    'UNDP Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/UNDP_logo.svg/200px-UNDP_logo.svg.png',
    'UNDP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/UNDP_logo.svg/200px-UNDP_logo.svg.png',
    'UNHCR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/UNHCR.svg/200px-UNHCR.svg.png',
    'Oxfam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Oxfam_logo.svg/200px-Oxfam_logo.svg.png',
    'CARE International': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/CARE_logo.svg/200px-CARE_logo.svg.png',
    'CARE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/CARE_logo.svg/200px-CARE_logo.svg.png',
    'World Vision': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/World_Vision_logo.svg/200px-World_Vision_logo.svg.png',
    'Red Cross Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_the_Red_Cross.svg/200px-Flag_of_the_Red_Cross.svg.png',
    'Red Cross': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_the_Red_Cross.svg/200px-Flag_of_the_Red_Cross.svg.png',
    'Plan International': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Plan_international_logo.svg/200px-Plan_international_logo.svg.png',
    'World Bank': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_World_Bank_logo.svg/200px-The_World_Bank_logo.svg.png',
    'World Bank Ethiopia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_World_Bank_logo.svg/200px-The_World_Bank_logo.svg.png',
    'African Union': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_the_African_Union.svg/200px-Flag_of_the_African_Union.svg.png',
    'Commercial Bank of Ethiopia': 'https://ui-avatars.com/api/?name=CBE&background=0066CC&color=fff&size=200&bold=true',
    'Ethiopian Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Ethiopian_Airlines_Logo.svg/200px-Ethiopian_Airlines_Logo.svg.png',
    'Ethio Telecom': 'https://ui-avatars.com/api/?name=ET&background=FF6B00&color=fff&size=200&bold=true',
    'Dashen Bank': 'https://ui-avatars.com/api/?name=DB&background=003366&color=fff&size=200&bold=true',
    'Awash Bank': 'https://ui-avatars.com/api/?name=AB&background=8B0000&color=fff&size=200&bold=true',
    'Safaricom Ethiopia': 'https://ui-avatars.com/api/?name=SE&background=00A651&color=fff&size=200&bold=true',
    'Zemen Bank': 'https://ui-avatars.com/api/?name=ZB&background=006699&color=fff&size=200&bold=true',
};

// Generate logo URL for any organization
const getLogoUrl = (orgName) => {
    // Check exact match first
    if (organizationLogos[orgName]) {
        return organizationLogos[orgName];
    }

    // Check partial matches
    for (const [key, url] of Object.entries(organizationLogos)) {
        if (orgName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(orgName.toLowerCase())) {
            return url;
        }
    }

    // Generate UI Avatars URL for unknown organizations
    const initials = orgName
        .split(' ')
        .slice(0, 3)
        .map(word => word.charAt(0).toUpperCase())
        .join('');

    // Generate a consistent color based on org name
    const colors = ['3498DB', 'E74C3C', '2ECC71', '9B59B6', 'F39C12', '1ABC9C', 'E67E22', '34495E'];
    const colorIndex = orgName.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    return `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=fff&size=200&bold=true`;
};

const addLogosToJobs = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        // Get all jobs without logos
        const jobs = await Job.find({ $or: [{ logo: null }, { logo: { $exists: false } }] });
        console.log(`Found ${jobs.length} jobs without logos`);

        let updated = 0;
        for (const job of jobs) {
            const logoUrl = getLogoUrl(job.organization);
            await Job.updateOne(
                { _id: job._id },
                { $set: { logo: logoUrl } }
            );
            updated++;
            if (updated % 20 === 0) {
                console.log(`Updated ${updated}/${jobs.length} jobs...`);
            }
        }

        console.log(`\n✅ Done! Updated ${updated} jobs with logos.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addLogosToJobs();
