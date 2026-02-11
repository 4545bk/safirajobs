/**
 * Applications Service - Mobile API calls for tracking
 */

import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

/**
 * Get all applications for device
 */
export const getApplications = async (deviceToken, status = 'all') => {
    const url = `${API_BASE_URL}/applications?deviceToken=${encodeURIComponent(deviceToken)}&status=${status}`;
    const response = await fetch(url);
    return await response.json();
};

/**
 * Get application statistics
 */
export const getApplicationStats = async (deviceToken) => {
    const response = await fetch(`${API_BASE_URL}/applications/stats?deviceToken=${encodeURIComponent(deviceToken)}`);
    return await response.json();
};

/**
 * Track a new job application
 */
export const trackApplication = async (data) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
};

/**
 * Update application
 */
export const updateApplication = async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    return await response.json();
};

/**
 * Update application status
 */
export const updateStatus = async (id, status, note = '') => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
    });
    return await response.json();
};

/**
 * Delete/stop tracking application
 */
export const deleteApplication = async (id) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, { method: 'DELETE' });
    return await response.json();
};

/**
 * Check if tracking a specific job
 */
export const checkTracking = async (deviceToken, jobId) => {
    const response = await fetch(`${API_BASE_URL}/applications/check/${jobId}?deviceToken=${encodeURIComponent(deviceToken)}`);
    return await response.json();
};

/**
 * Submit a full job application (with email + resume)
 */
export const submitApplication = async (data) => {
    const response = await fetch(`${API_BASE_URL}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
};
