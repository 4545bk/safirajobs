/**
 * Theme Context - Dark Mode Support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Light theme colors
export const lightColors = {
    primary: '#1A56DB',
    primaryLight: '#3B82F6',
    primaryDark: '#1E40AF',
    accent: '#FF6B6B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8F9FE',
    surface: '#FFFFFF',
    surfaceHover: '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    card: '#FFFFFF',
    logoColors: [
        { bg: '#DBEAFE', text: '#1D4ED8' },
        { bg: '#D1FAE5', text: '#047857' },
        { bg: '#FEE2E2', text: '#DC2626' },
        { bg: '#FED7AA', text: '#EA580C' },
        { bg: '#E0E7FF', text: '#4338CA' },
        { bg: '#CFFAFE', text: '#0891B2' },
        { bg: '#F3E8FF', text: '#7C3AED' },
        { bg: '#FEF3C7', text: '#D97706' },
    ],
};

// Dark theme colors
export const darkColors = {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    accent: '#FF6B6B',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textOnPrimary: '#FFFFFF',
    border: '#334155',
    borderLight: '#1E293B',
    card: '#1E293B',
    logoColors: [
        { bg: '#1E3A5F', text: '#60A5FA' },
        { bg: '#064E3B', text: '#34D399' },
        { bg: '#7F1D1D', text: '#FCA5A5' },
        { bg: '#7C2D12', text: '#FDBA74' },
        { bg: '#312E81', text: '#A5B4FC' },
        { bg: '#164E63', text: '#67E8F9' },
        { bg: '#4C1D95', text: '#C4B5FD' },
        { bg: '#78350F', text: '#FCD34D' },
    ],
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            setIsDark(savedTheme === 'dark');
        } catch (error) {
            console.error('Failed to load theme:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDark;
            setIsDark(newTheme);
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors, isLoaded }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Helper to get logo color based on name
export const getLogoColor = (name, isDark = false) => {
    const colorSet = isDark ? darkColors.logoColors : lightColors.logoColors;
    const index = (name?.charCodeAt(0) || 0) % colorSet.length;
    return colorSet[index];
};

export default { ThemeProvider, useTheme, lightColors, darkColors, getLogoColor };
