/**
 * Preview Button Component
 * Floating button to open CV preview modal
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

const PreviewButton = ({ onPress, style }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
        <Feather name="eye" size={16} color={colors.primary} />
        <Text style={styles.text}>Preview</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: '#EBF5FF',
    },
    text: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.primary,
    },
});

export default PreviewButton;
