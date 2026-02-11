/**
 * CV Data Mapper - Converts SafiraJobs CV data to Lovable template format
 */

/**
 * Flatten grouped skills into a single array
 */
export function flattenSkills(skills) {
    if (!skills) return [];

    const flattened = [];

    if (skills.technical) {
        skills.technical.forEach(skill => {
            flattened.push({
                name: skill.name,
                level: getLevelPercent(skill.level),
                category: 'Technical'
            });
        });
    }

    if (skills.software) {
        skills.software.forEach(skill => {
            flattened.push({
                name: skill.name,
                level: getLevelPercent(skill.level),
                category: 'Software'
            });
        });
    }

    if (skills.soft) {
        skills.soft.forEach(skill => {
            flattened.push({
                name: skill.name,
                level: 80, // Default for soft skills
                category: 'Soft Skills'
            });
        });
    }

    return flattened;
}

/**
 * Convert level string to percentage
 */
function getLevelPercent(level) {
    const levels = {
        'beginner': 25,
        'intermediate': 50,
        'advanced': 75,
        'expert': 95
    };
    return levels[level?.toLowerCase()] || 70;
}

/**
 * Convert language proficiency to percentage
 */
function getLanguagePercent(proficiency) {
    const levels = {
        'native': 100,
        'fluent': 90,
        'advanced': 75,
        'intermediate': 60,
        'basic': 40
    };
    return levels[proficiency?.toLowerCase()] || 70;
}

/**
 * Format date object to string
 */
function formatDate(dateObj) {
    if (!dateObj) return '';
    if (typeof dateObj === 'string') return dateObj;
    if (dateObj.year) {
        return dateObj.month ? `${dateObj.month}/${dateObj.year}` : String(dateObj.year);
    }
    return '';
}

/**
 * Map SafiraJobs CV data to Lovable template format
 */
export function mapToLovableFormat(cvData) {
    if (!cvData) return null;

    const { personalInfo, professionalSummary, education, experience, skills, languages, certificates, references, hobbies } = cvData;

    return {
        personal: {
            firstName: personalInfo?.firstName || '',
            lastName: personalInfo?.lastName || '',
            jobTitle: personalInfo?.jobTitle || personalInfo?.title || 'Professional',
            email: personalInfo?.email || '',
            phone: personalInfo?.phone || '',
            location: [personalInfo?.city, personalInfo?.country].filter(Boolean).join(', '),
            website: personalInfo?.linkedIn || personalInfo?.website || '',
            photoUrl: personalInfo?.photoUrl || null
        },
        summary: {
            text: professionalSummary?.text || ''
        },
        education: (education || []).map((edu, idx) => ({
            id: String(idx + 1),
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.fieldOfStudy || '',
            startYear: formatDate(edu.startDate),
            endYear: edu.isCurrently ? 'Present' : formatDate(edu.endDate),
            description: edu.description || '',
            gpa: edu.gpa || ''
        })),
        experience: (experience || []).map((exp, idx) => ({
            id: String(idx + 1),
            company: exp.organization || exp.company || '',
            position: exp.jobTitle || exp.position || '',
            startDate: formatDate(exp.startDate),
            endDate: exp.isCurrently ? 'Present' : formatDate(exp.endDate),
            location: exp.location?.city || '',
            responsibilities: exp.responsibilities || []
        })),
        skills: flattenSkills(skills),
        languages: (languages || []).map(lang => ({
            name: lang.name || '',
            proficiency: lang.proficiency || 'Intermediate',
            level: getLanguagePercent(lang.proficiency)
        })),
        certificates: (certificates || []).map((cert, idx) => ({
            id: String(idx + 1),
            name: cert.name || '',
            issuer: cert.issuer || '',
            year: cert.year || ''
        })),
        references: (references || []).map((ref, idx) => ({
            id: String(idx + 1),
            name: ref.name || '',
            position: ref.position || '',
            company: ref.company || '',
            phone: ref.phone || '',
            email: ref.email || ''
        })),
        hobbies: hobbies || []
    };
}

export default { mapToLovableFormat, flattenSkills };
