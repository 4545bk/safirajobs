/**
 * Upload Service
 * Handles file uploads to backend
 */

import * as FileSystem from 'expo-file-system';
import { getAuthToken } from './auth';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

/**
 * Upload profile image
 * @param {string} userId - User ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<object>} - Result with url
 */
export const uploadProfileImage = async (userId, imageUri) => {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error('Not authenticated');

        // Convert to base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const image = `data:image/jpeg;base64,${base64}`;

        const response = await fetch(`${API_BASE_URL}/upload/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, image }),
        });

        return await response.json();
    } catch (error) {
        console.error('Upload profile image error:', error);
        return { success: false, error: 'Upload failed' };
    }
};

/**
 * Upload CV image (preview)
 */
export const uploadCVImage = async (userId, cvId, imageUri) => {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const image = `data:image/jpeg;base64,${base64}`;

        const response = await fetch(`${API_BASE_URL}/upload/cv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, cvId, image }),
        });

        return await response.json();
    } catch (error) {
        console.error('Upload CV image error:', error);
        return { success: false, error: 'Upload failed' };
    }
};

export default {
    uploadProfileImage,
    uploadCVImage
};
