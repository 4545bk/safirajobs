/**
 * Employer Auth Service
 * Authentication and employer API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

const AUTH_STORAGE_KEY = '@safirajobs_auth';

/**
 * Get stored auth token
 */
export const getAuthToken = async () => {
    try {
        const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return parsed.token;
        }
        return null;
    } catch (error) {
        console.error('Get auth token error:', error);
        return null;
    }
};

/**
 * Get stored user data
 */
export const getStoredUser = async () => {
    try {
        const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Get stored user error:', error);
        return null;
    }
};

/**
 * Store auth data
 */
const storeAuth = async (token, user) => {
    try {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
    } catch (error) {
        console.error('Store auth error:', error);
    }
};

/**
 * Clear auth data (logout)
 */
export const clearAuth = async () => {
    try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.error('Clear auth error:', error);
    }
};

/**
 * Register a new user
 */
export const register = async ({ email, password, role, profile }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, profile }),
    });

    const data = await response.json();

    if (data.success && data.data?.token) {
        await storeAuth(data.data.token, data.data.user);
    }

    return data;
};

/**
 * Login user
 */
export const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.data?.token) {
        await storeAuth(data.data.token, data.data.user);
    }

    return data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    const token = await getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (data.success && data.data) {
        const stored = await getStoredUser();
        await storeAuth(stored.token, data.data);
    }

    return data;
};

// ==================
// Employer API Calls
// ==================

/**
 * Get employer dashboard stats
 */
export const getEmployerDashboard = async () => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/employer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
};

/**
 * Get employer's jobs
 */
export const getEmployerJobs = async (status = 'all', page = 1) => {
    const token = await getAuthToken();

    const response = await fetch(
        `${API_BASE_URL}/employer/jobs?status=${status}&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.json();
};

/**
 * Create a new job
 */
export const createJob = async (jobData) => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/employer/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
    });

    return response.json();
};

/**
 * Update a job
 */
export const updateJob = async (jobId, updates) => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });

    return response.json();
};

/**
 * Delete a job
 */
export const deleteJob = async (jobId) => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
};

/**
 * Get applicants for a job
 */
export const getJobApplicants = async (jobId) => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
};

/**
 * Update applicant status
 */
export const updateApplicantStatus = async (applicationId, status, note = '') => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/employer/applicants/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
    });

    return response.json();
};

/**
 * Get analytics overview
 */
export const getAnalyticsOverview = async () => {
    const token = await getAuthToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
};

/**
 * Get daily analytics for charts
 */
export const getAnalyticsDaily = async () => {
    const token = await getAuthToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    const response = await fetch(`${API_BASE_URL}/analytics/daily`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
};
