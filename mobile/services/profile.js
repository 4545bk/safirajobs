/**
 * Profile Data Storage Service
 * Stores user profile, education, skills, experience in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@safirajobs_profile';

// Default profile data - empty for new users
const DEFAULT_PROFILE = {
    name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
    completionPercent: 0,
};

const DEFAULT_EDUCATION = [];
const DEFAULT_SKILLS = [];
const DEFAULT_EXPERIENCE = [];

/**
 * Get user profile
 */
export const getProfile = async () => {
    try {
        const data = await AsyncStorage.getItem(PROFILE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return {
            profile: DEFAULT_PROFILE,
            education: DEFAULT_EDUCATION,
            skills: DEFAULT_SKILLS,
            experience: DEFAULT_EXPERIENCE,
        };
    } catch (error) {
        console.error('Error getting profile:', error);
        return {
            profile: DEFAULT_PROFILE,
            education: DEFAULT_EDUCATION,
            skills: DEFAULT_SKILLS,
            experience: DEFAULT_EXPERIENCE,
        };
    }
};

/**
 * Save profile data
 */
export const saveProfile = async (profileData) => {
    try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
};

/**
 * Update basic profile info
 */
export const updateProfileInfo = async (info) => {
    try {
        const current = await getProfile();
        const updated = {
            ...current,
            profile: { ...current.profile, ...info },
        };
        await saveProfile(updated);
        return updated;
    } catch (error) {
        console.error('Error updating profile:', error);
        return null;
    }
};

/**
 * Add education entry
 */
export const addEducation = async (education) => {
    try {
        const current = await getProfile();
        const updated = {
            ...current,
            education: [...current.education, { ...education, id: Date.now().toString() }],
        };
        await saveProfile(updated);
        return updated;
    } catch (error) {
        console.error('Error adding education:', error);
        return null;
    }
};

/**
 * Add skill
 */
export const addSkill = async (skill) => {
    try {
        const current = await getProfile();
        const updated = {
            ...current,
            skills: [...current.skills, { name: skill, id: Date.now().toString() }],
        };
        await saveProfile(updated);
        return updated;
    } catch (error) {
        console.error('Error adding skill:', error);
        return null;
    }
};

/**
 * Add experience entry
 */
export const addExperience = async (experience) => {
    try {
        const current = await getProfile();
        const updated = {
            ...current,
            experience: [...current.experience, { ...experience, id: Date.now().toString() }],
        };
        await saveProfile(updated);
        return updated;
    } catch (error) {
        console.error('Error adding experience:', error);
        return null;
    }
};

/**
 * Calculate profile completion percentage
 */
export const calculateCompletion = (profileData) => {
    let score = 0;
    const { profile, education, skills, experience } = profileData;

    // Basic info (40%)
    if (profile.name) score += 10;
    if (profile.title) score += 10;
    if (profile.email) score += 10;
    if (profile.bio) score += 10;

    // Education (20%)
    if (education.length > 0) score += 20;

    // Skills (20%)
    if (skills.length >= 3) score += 20;
    else if (skills.length > 0) score += 10;

    // Experience (20%)
    if (experience.length > 0) score += 20;

    return score;
};

/**
 * Clear all profile data
 */
export const clearProfile = async () => {
    try {
        await AsyncStorage.removeItem(PROFILE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing profile:', error);
        return false;
    }
};

export default {
    getProfile,
    saveProfile,
    updateProfileInfo,
    addEducation,
    addSkill,
    addExperience,
    calculateCompletion,
    clearProfile,
};
