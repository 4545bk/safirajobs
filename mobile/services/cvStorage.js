/**
 * CV Storage Service
 * Handles saving/loading CV data to AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for CV data
const CV_STORAGE_KEY = '@safirajobs_cv_data';

/**
 * Default empty CV structure
 */
export const getEmptyCV = () => ({
    id: `cv_${Date.now()}`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionPercent: 0,
    currentStep: 0,

    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        region: '',
        country: 'Ethiopia',
        photo: null,
        linkedIn: '',
    },

    professionalSummary: {
        text: '',
    },

    education: [],
    experience: [],

    skills: {
        technical: [],
        software: [],
        soft: [],
    },

    languages: [],
    certifications: [],

    preferences: {
        templateId: 'professional_blue',
        showPhoto: true,
    },
});

/**
 * Load CV data from AsyncStorage
 * @returns {Promise<Object|null>} CV data or null if not found
 */
export const loadCV = async () => {
    try {
        const data = await AsyncStorage.getItem(CV_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Error loading CV:', error);
        return null;
    }
};

/**
 * Save CV data to AsyncStorage
 * @param {Object} cvData - The CV data to save
 * @returns {Promise<boolean>} Success status
 */
export const saveCV = async (cvData) => {
    try {
        const dataToSave = {
            ...cvData,
            updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(CV_STORAGE_KEY, JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Error saving CV:', error);
        return false;
    }
};

/**
 * Update a specific section of the CV
 * @param {string} section - Section name (e.g., 'personalInfo')
 * @param {Object} data - New data for that section
 * @returns {Promise<Object|null>} Updated CV or null on error
 */
export const updateCVSection = async (section, data) => {
    try {
        let cv = await loadCV();
        if (!cv) {
            cv = getEmptyCV();
        }

        const updatedCV = {
            ...cv,
            [section]: data,
            updatedAt: new Date().toISOString(),
        };

        await saveCV(updatedCV);
        return updatedCV;
    } catch (error) {
        console.error('Error updating CV section:', error);
        return null;
    }
};

/**
 * Calculate CV completion percentage
 * @param {Object} cv - CV data object
 * @returns {number} Completion percentage (0-100)
 */
export const calculateCompletion = (cv) => {
    if (!cv) return 0;

    let score = 0;

    // Personal Info (25%)
    const p = cv.personalInfo || {};
    if (p.firstName && p.lastName) score += 10;
    if (p.email) score += 5;
    if (p.phone) score += 5;
    if (p.city) score += 5;

    // Professional Summary (15%)
    if (cv.professionalSummary?.text?.length > 50) score += 15;

    // Education (20%)
    if (cv.education?.length > 0) score += 20;

    // Experience (25%)
    if (cv.experience?.length > 0) score += 25;

    // Skills (10%)
    const skillCount = [
        ...(cv.skills?.technical || []),
        ...(cv.skills?.software || []),
    ].length;
    if (skillCount >= 3) score += 10;

    // Languages (5%)
    if (cv.languages?.length > 0) score += 5;

    return Math.min(score, 100);
};

/**
 * Clear all CV data
 * @returns {Promise<boolean>} Success status
 */
export const clearCV = async () => {
    try {
        await AsyncStorage.removeItem(CV_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing CV:', error);
        return false;
    }
};

export default {
    loadCV,
    saveCV,
    updateCVSection,
    calculateCompletion,
    clearCV,
    getEmptyCV,
};
