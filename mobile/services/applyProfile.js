/**
 * Apply Profile Service - Save & load user's apply profile locally
 * So they only need to fill in their details once!
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@safirajobs_apply_profile';
const RESUME_KEY = '@safirajobs_saved_resume';

/**
 * Save apply profile (email, phone, name)
 */
export const saveApplyProfile = async (profile) => {
    try {
        const data = {
            email: profile.email || '',
            phone: profile.phone || '',
            name: profile.name || '',
            savedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.warn('Failed to save apply profile:', error);
        return false;
    }
};

/**
 * Load saved apply profile
 */
export const loadApplyProfile = async () => {
    try {
        const data = await AsyncStorage.getItem(PROFILE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.warn('Failed to load apply profile:', error);
        return null;
    }
};

/**
 * Save resume info (name + Cloudinary URL after first upload)
 */
export const saveResumeInfo = async (resumeInfo) => {
    try {
        const data = {
            name: resumeInfo.name || '',
            uri: resumeInfo.uri || '',
            cloudinaryUrl: resumeInfo.cloudinaryUrl || '',
            mimeType: resumeInfo.mimeType || 'application/pdf',
            savedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(RESUME_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.warn('Failed to save resume info:', error);
        return false;
    }
};

/**
 * Load saved resume info
 */
export const loadResumeInfo = async () => {
    try {
        const data = await AsyncStorage.getItem(RESUME_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.warn('Failed to load resume info:', error);
        return null;
    }
};

/**
 * Clear all saved apply data
 */
export const clearApplyProfile = async () => {
    try {
        await AsyncStorage.multiRemove([PROFILE_KEY, RESUME_KEY]);
        return true;
    } catch (error) {
        console.warn('Failed to clear apply profile:', error);
        return false;
    }
};

/**
 * Check if profile exists
 */
export const hasApplyProfile = async () => {
    try {
        const data = await AsyncStorage.getItem(PROFILE_KEY);
        return !!data;
    } catch {
        return false;
    }
};
