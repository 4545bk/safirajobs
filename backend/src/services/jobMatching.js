/**
 * Job Matching Service
 * Calculates match scores between users and jobs based on skills, location, and experience.
 */

const User = require('../models/User');

// Weights for different factors (Total = 100)
const WEIGHTS = {
    SKILLS: 50,
    LOCATION: 30,
    EXPERIENCE: 20
};

/**
 * Calculate match score and reasons for a job against a user profile
 * @param {Object} job - The job document
 * @param {Object} user - The user document
 * @returns {Object} { score, reasons, missing }
 */
const calculateMatch = (job, user) => {
    let score = 0;
    const reasons = [];
    const missing = [];

    // Early return if critical data is missing
    if (!user.skills && !user.location && !user.experience) {
        return { score: 0, reasons: [], missing: [] };
    }

    // 1. Skills Match (50%)
    if (job.skills && job.skills.length > 0 && user.skills && user.skills.length > 0) {
        // Normalize skills to lowercase for better matching
        const jobSkills = job.skills.map(s => s.toLowerCase().trim());
        const userSkills = user.skills.map(s => s.toLowerCase().trim());

        // Find matches
        // We use some fuzzy matching logic here (substrings)
        const matches = jobSkills.filter(jSkill =>
            userSkills.some(uSkill => uSkill.includes(jSkill) || jSkill.includes(uSkill))
        );

        const matchPercentage = matches.length / jobSkills.length;
        const skillScore = matchPercentage * WEIGHTS.SKILLS;
        score += skillScore;

        if (matches.length > 0) {
            // Cap reason list to keep it clean
            const matchedNames = matches.map(s =>
                s.charAt(0).toUpperCase() + s.slice(1)
            ).slice(0, 3);

            reasons.push({
                type: 'skill',
                message: `✅ Skills match: ${matchedNames.join(', ')}${matches.length > 3 ? '...' : ''}`
            });
        }

        // Identify missing important skills
        const missingSkills = jobSkills.filter(jSkill =>
            !userSkills.some(uSkill => uSkill.includes(jSkill) || jSkill.includes(uSkill))
        ).slice(0, 2);

        if (missingSkills.length > 0) {
            const missingNames = missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));
            missing.push(`❌ Missing skill: ${missingNames.join(', ')}`);
        }
    } else {
        // If job has no skills defined, give partial credit if title matches user skills?
        // For now, neutral.
    }

    // 2. Location Match (30%)
    let locationMatch = false;

    // Check for Remote match
    const jobIsRemote = job.workType === 'remote' ||
        job.location?.toLowerCase().includes('remote') ||
        job.title?.toLowerCase().includes('remote');

    const userWantsRemote = user.profile?.location?.toLowerCase().includes('remote') ||
        user.preferences?.workType?.includes('remote');

    if (jobIsRemote && userWantsRemote) {
        locationMatch = true;
        reasons.push({
            type: 'location',
            message: '✅ Remote work available'
        });
    } else if (job.location && user.profile?.location) {
        // Simple string check for city/country
        const jobLoc = job.location.toLowerCase();
        const userLoc = user.profile.location.toLowerCase();

        if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) {
            locationMatch = true;
            reasons.push({
                type: 'location',
                message: `✅ Location match: ${job.location}`
            });
        }
    }

    if (locationMatch) {
        score += WEIGHTS.LOCATION;
    } else if (job.location) {
        missing.push(`📍 Location mismatch: Job is in ${job.location}`);
    }

    // 3. Experience Match (20%)
    let experienceMatch = false;

    // Normalize levels
    const normalizeLevel = (lvl) => {
        if (!lvl) return 'unknown';
        lvl = lvl.toLowerCase();
        if (lvl.includes('senior') || lvl.includes('lead') || lvl.includes('principal') || lvl.includes('manager')) return 'senior';
        if (lvl.includes('mid') || lvl.includes('intermediate')) return 'mid';
        if (lvl.includes('entry') || lvl.includes('junior') || lvl.includes('intern')) return 'entry';
        return 'unknown';
    };

    const jobLevel = normalizeLevel(job.experienceLevel);
    // User experience might be stored as years or string level. Assuming string for now based on profile form
    const userExp = normalizeLevel(typeof user.experience === 'string' ? user.experience : user.profile?.experience);

    if (jobLevel !== 'unknown' && userExp !== 'unknown') {
        if (jobLevel === userExp) {
            experienceMatch = true;
            reasons.push({
                type: 'experience',
                message: '✅ Experience level fits your profile'
            });
        } else if (userExp === 'senior' && jobLevel === 'mid') {
            // Overqualified is still a "match" capability-wise
            experienceMatch = true;
            reasons.push({
                type: 'experience',
                message: '✅ You are well-qualified for this role'
            });
        }
    } else {
        // Fallback: If no explicit level, check years if available
        // (Skipping for now to keep simple)
    }

    if (experienceMatch) {
        score += WEIGHTS.EXPERIENCE;
    }

    return {
        score: Math.round(score),
        reasons,
        missing
    };
};

/**
 * Process a list of jobs and add match data for a user
 * @param {Array} jobs - List of job documents
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Jobs with matchData appended
 */
const addMatchDataToJobs = async (jobs, userId) => {
    if (!userId) return jobs;

    try {
        const user = await User.findById(userId).lean();
        if (!user) return jobs;

        // Ensure user has essential arrays initialized
        user.skills = user.skills || [];

        return jobs.map(job => {
            // If it's a mongoose document, convert to object
            const jobObj = job.toObject ? job.toObject() : job;

            const matchResult = calculateMatch(jobObj, user);

            return {
                ...jobObj,
                matchData: matchResult
            };
        });
    } catch (error) {
        console.error('Error calculating matches:', error);
        return jobs;
    }
};

module.exports = {
    calculateMatch,
    addMatchDataToJobs
};
