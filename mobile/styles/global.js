import { StyleSheet } from 'react-native';

// Color palette - Modern, professional look
export const colors = {
    // Primary colors
    primary: '#6366f1',      // Indigo
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',

    // Background colors
    background: '#0f0f1a',   // Deep dark
    surface: '#1a1a2e',      // Card background
    surfaceLight: '#252542', // Elevated surface

    // Text colors
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',

    // Accent colors
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red

    // Border
    border: '#374151',
};

// Common styles
export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },

    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },

    bodyText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    button: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: 'center',
    },

    buttonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    chip: {
        backgroundColor: colors.surfaceLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginRight: 8,
    },

    chipText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
