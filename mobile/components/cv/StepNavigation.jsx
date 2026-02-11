/**
 * Step Navigation Component
 * Back and Continue buttons for CV wizard
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

const StepNavigation = ({
    onBack,
    onContinue,
    backLabel = 'Back',
    continueLabel = 'Continue',
    showBack = true,
    canContinue = true,
    isLoading = false,
}) => {
    return (
        <View style={styles.container}>
            {/* Back Button */}
            {showBack ? (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    disabled={isLoading}
                >
                    <Feather name="arrow-left" size={20} color={colors.textSecondary} />
                    <Text style={styles.backText}>{backLabel}</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.backButton} />
            )}

            {/* Continue Button */}
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    !canContinue && styles.continueButtonDisabled,
                ]}
                onPress={onContinue}
                disabled={!canContinue || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                    <>
                        <Text style={styles.continueText}>{continueLabel}</Text>
                        <Feather name="arrow-right" size={20} color={colors.textOnPrimary} />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minWidth: 80,
    },
    backText: {
        fontSize: typography.base,
        color: colors.textSecondary,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    continueButtonDisabled: {
        backgroundColor: colors.textMuted,
        shadowOpacity: 0,
    },
    continueText: {
        fontSize: typography.base,
        fontWeight: typography.semibold,
        color: colors.textOnPrimary,
    },
});

export default StepNavigation;
