/**
 * Empty State Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const EmptyState = ({ onClearFilters, message = "No jobs found", subMessage = "We couldn't find any jobs matching your criteria." }) => {
    return (
        <View style={styles.container}>
            {/* Icon */}
            <View style={styles.iconContainer}>
                <Feather name="search" size={40} color={colors.primary} />
            </View>

            {/* Message */}
            <Text style={styles.title}>{message}</Text>
            <Text style={styles.subtitle}>{subMessage}</Text>

            {/* Clear Button */}
            {onClearFilters && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={onClearFilters}
                    activeOpacity={0.8}
                >
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: spacing.xxl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 220,
        marginBottom: spacing.xxl,
    },
    clearButton: {
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    clearButtonText: {
        fontSize: typography.base,
        fontWeight: typography.semibold,
        color: colors.primary,
    },
});

export default EmptyState;
