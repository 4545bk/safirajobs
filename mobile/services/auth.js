/**
 * Authentication Service
 * Unified auth for all user types
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Use same storage key as employer auth to share session if possible, 
// or separate if distinct apps. Assuming single app for now.
const AUTH_KEY = '@safirajobs_auth';
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

export const getAuthToken = async () => {
    try {
        const data = await AsyncStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data).token : null;
    } catch (e) {
        return null;
    }
};

export const getUser = async () => {
    try {
        const data = await AsyncStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data).user : null;
    } catch (e) {
        return null;
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.success && data.data?.token) {
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({
                token: data.data.token,
                user: data.data.user
            }));
            await AsyncStorage.setItem('isLoggedIn', 'true'); // Keep legacy flag
        }
        return data;
    } catch (error) {
        console.error('Auth login error:', error);
        return { success: false, message: 'Network error. Check your connection.' };
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (data.success && data.data?.token) {
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({
                token: data.data.token,
                user: data.data.user
            }));
            await AsyncStorage.setItem('isLoggedIn', 'true');
        }
        return data;
    } catch (error) {
        console.error('Auth register error:', error);
        return { success: false, message: 'Network error. Check your connection.' };
    }
};

export const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user'); // Remove legacy user object
};

export const changePassword = async (currentPassword, newPassword) => {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
};

export const updateProfile = async (profileData) => {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData),
        });
        const data = await response.json();

        if (data.success && data.data) {
            // Update local storage
            const currentAuth = await AsyncStorage.getItem(AUTH_KEY);
            if (currentAuth) {
                const parsed = JSON.parse(currentAuth);
                await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({
                    ...parsed,
                    user: data.data
                }));
            }
        }
        return data;
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, message: 'Network error' };
    }
};

export const fetchUserProfile = async () => {
    const token = await getAuthToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success && data.data) {
            // Update local storage
            const currentAuth = await AsyncStorage.getItem(AUTH_KEY);
            if (currentAuth) {
                const parsed = JSON.parse(currentAuth);
                await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({
                    ...parsed,
                    user: data.data
                }));
            }
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Fetch profile error:', error);
        return null;
    }
};

// Delete user account and all local data
export const deleteAccount = async () => {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
    }

    // Clear all local data
    await AsyncStorage.clear();
    return data;
};

export default {
    login,
    register,
    logout,
    changePassword,
    getAuthToken,
    getUser,
    updateProfile,
    fetchUserProfile,
    deleteAccount
};
