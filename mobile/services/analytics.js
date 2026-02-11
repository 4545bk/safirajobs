/**
 * Analytics Service
 * Handles tracking of views and clicks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

// Get or create a persistent visitor ID
const getVisitorId = async () => {
    try {
        let visitorId = await AsyncStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = Crypto.randomUUID();
            await AsyncStorage.setItem('visitor_id', visitorId);
        }
        return visitorId;
    } catch (error) {
        return 'unknown-visitor';
    }
};

/**
 * Track a job view
 * @param {string} jobId 
 * @param {string} source - 'search', 'similar', etc.
 */
export const trackJobView = async (jobId, source = 'direct') => {
    try {
        const visitorId = await getVisitorId();
        const token = await AsyncStorage.getItem('userToken');

        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        await fetch(`${API_URL}/analytics/view`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jobId, visitorId, source }),
        });
    } catch (error) {
        // Silently fail for analytics
        console.log('Track view error (ignored):', error.message);
    }
};

/**
 * Track an apply click
 * @param {string} jobId 
 * @param {string} source 
 */
export const trackApplyClick = async (jobId, source = 'direct') => {
    try {
        const visitorId = await getVisitorId();
        const token = await AsyncStorage.getItem('userToken');

        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        await fetch(`${API_URL}/analytics/click`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jobId, visitorId, source }),
        });
    } catch (error) {
        console.log('Track click error (ignored):', error.message);
    }
};
