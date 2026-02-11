/**
 * Push notifications service using Expo Notifications
 * Handles token registration and notification handling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Backend API URL (same as api.js)
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications
 * Returns the Expo push token or null
 */
export const registerForPushNotifications = async () => {
    let token = null;

    // Skip on non-physical devices (emulators)
    if (!Device.isDevice) {
        // Silent return on emulator - no console warning needed
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
    }

    // Get Expo push token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo push token:', token);
    } catch (error) {
        console.error('Failed to get push token:', error);
        return null;
    }

    // Android-specific notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4FD1C5',
        });
    }

    return token;
};

/**
 * Register push token with backend
 * @param {string} token - Expo push token
 */
export const registerTokenWithBackend = async (token) => {
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pushToken: token,
                platform: Platform.OS,
            }),
        });

        if (response.ok) {
            console.log('Push token registered with backend');
            return true;
        } else {
            console.warn('Failed to register token:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Failed to register token with backend:', error);
        return false;
    }
};

/**
 * Unregister push token from backend
 * @param {string} token - Expo push token
 */
export const unregisterToken = async (token) => {
    if (!token) return;

    try {
        await fetch(`${API_BASE_URL}/devices/${encodeURIComponent(token)}`, {
            method: 'DELETE',
        });
        console.log('Push token unregistered');
    } catch (error) {
        console.error('Failed to unregister token:', error);
    }
};

/**
 * Add notification received listener
 * @param {Function} callback - Called when notification received while app is open
 */
export const addNotificationReceivedListener = (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener
 * @param {Function} callback - Called when user taps notification
 */
export const addNotificationResponseListener = (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Get last notification response (for deep linking)
 */
export const getLastNotificationResponse = async () => {
    return await Notifications.getLastNotificationResponseAsync();
};

/**
 * Schedule a local notification (for testing)
 */
export const scheduleLocalNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
        },
        trigger: { seconds: 1 },
    });
};
