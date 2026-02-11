/**
 * Job Alerts Service - Mobile API calls
 */

import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

/**
 * Get all alerts for a device
 */
export const getAlerts = async (deviceToken) => {
    const response = await fetch(
        `${API_BASE_URL}/alerts?deviceToken=${encodeURIComponent(deviceToken)}`
    );
    return await response.json();
};

/**
 * Create a new alert
 */
export const createAlert = async (alertData) => {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
    });
    return await response.json();
};

/**
 * Update an alert
 */
export const updateAlert = async (alertId, updates) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    return await response.json();
};

/**
 * Delete an alert
 */
export const deleteAlert = async (alertId) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
        method: 'DELETE'
    });
    return await response.json();
};

/**
 * Toggle alert active status
 */
export const toggleAlert = async (alertId) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/toggle`, {
        method: 'PATCH'
    });
    return await response.json();
};

/**
 * Get available filter options
 */
export const getAlertOptions = async () => {
    const response = await fetch(`${API_BASE_URL}/alerts/options`);
    return await response.json();
};
