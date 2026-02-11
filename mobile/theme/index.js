/**
 * SafiraJobs Theme - Light Mode
 * Based on Figma design
 */

export const colors = {
    // Primary colors
    primary: '#1A56DB',
    primaryLight: '#3B82F6',
    primaryDark: '#1E40AF',

    // Accent colors
    accent: '#FF6B6B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Background colors
    background: '#F8F9FE',
    surface: '#FFFFFF',
    surfaceHover: '#F3F4F6',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Logo background colors for organizations
    logoColors: [
        { bg: '#DBEAFE', text: '#1D4ED8' }, // blue
        { bg: '#D1FAE5', text: '#047857' }, // green
        { bg: '#FEE2E2', text: '#DC2626' }, // red
        { bg: '#FED7AA', text: '#EA580C' }, // orange
        { bg: '#E0E7FF', text: '#4338CA' }, // indigo
        { bg: '#CFFAFE', text: '#0891B2' }, // cyan
        { bg: '#F3E8FF', text: '#7C3AED' }, // purple
        { bg: '#FEF3C7', text: '#D97706' }, // amber
    ],

    // Shadow (for reference - use with shadow styles)
    shadowColor: '#000000',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const typography = {
    // Font sizes
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,

    // Font weights (for style prop)
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

// Helper to get a consistent logo color based on organization name
export const getLogoColor = (name) => {
    const index = name.charCodeAt(0) % colors.logoColors.length;
    return colors.logoColors[index];
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    getLogoColor,
};
