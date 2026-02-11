/**
 * Google Authentication Hook
 * Uses expo-auth-session for Google Sign-In
 */

import { useEffect, useState, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
const GOOGLE_CONFIG = {
    androidClientId: '980947852178-agvrh2obbc2j5sml762h7urpsi10q5ml.apps.googleusercontent.com',
    webClientId: '980947852178-fq6qr1cgdavgavkl99s6odfggfsoj4ku.apps.googleusercontent.com',
    expoClientId: '980947852178-fq6qr1cgdavgavkl99s6odfggfsoj4ku.apps.googleusercontent.com',
};

export default function useGoogleAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Warm up browser on Android for faster auth
    useEffect(() => {
        if (Platform.OS === 'android') {
            WebBrowser.warmUpAsync();
            return () => {
                WebBrowser.coolDownAsync();
            };
        }
    }, []);

    // Configure Google Auth request with redirect
    const redirectUri = makeRedirectUri({
        scheme: 'safirajobs',
        path: 'auth',
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: GOOGLE_CONFIG.androidClientId,
        webClientId: GOOGLE_CONFIG.webClientId,
        expoClientId: GOOGLE_CONFIG.expoClientId,
        scopes: ['profile', 'email'],
        redirectUri,
    });

    // Handle auth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                fetchUserInfo(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            setError(response.error?.message || 'Google Sign-In failed');
            setLoading(false);
        } else if (response?.type === 'cancel') {
            setLoading(false);
        }
    }, [response]);

    // Fetch user info from Google
    const fetchUserInfo = async (accessToken) => {
        try {
            setLoading(true);
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch user info');
            }

            const userInfo = await res.json();

            // Store user data
            const userData = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                givenName: userInfo.given_name,
                familyName: userInfo.family_name,
                picture: userInfo.picture,
                accessToken,
            };

            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('isLoggedIn', 'true');
            await AsyncStorage.setItem('hasSeenWelcome', 'true');

            setUser(userData);
            setError(null);
        } catch (err) {
            console.error('Error fetching user info:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Sign in with Google
    const signInWithGoogle = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await promptAsync();
            if (result.type !== 'success') {
                setLoading(false);
            }
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [promptAsync]);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('isLoggedIn');
            setUser(null);
        } catch (err) {
            console.error('Sign out error:', err);
        }
    }, []);

    // Check for existing user on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error('Error loading user:', err);
            }
        };
        loadUser();
    }, []);

    return {
        user,
        loading,
        error,
        signInWithGoogle,
        signOut,
        isReady: !!request,
    };
}
