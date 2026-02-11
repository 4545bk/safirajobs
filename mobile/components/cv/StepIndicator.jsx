/**
 * Step Indicator Component
 * Shows progress through CV wizard steps
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const STEPS = [
    'Personal',
    'Summary',
    'Education',
    'Experience',
    'Skills',
    'Languages',
];

const StepIndicator = ({ currentStep = 1, totalSteps = 6 }) => {
    return (
        <View style={styles.container}>
            {/* Step counter */}
            <Text style={styles.stepText}>
                Step {currentStep} of {totalSteps}
            </Text>

            {/* Progress dots */}
            <View style={styles.dotsContainer}>
                {STEPS.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index + 1 < currentStep && styles.dotCompleted,
                            index + 1 === currentStep && styles.dotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Step label */}
            <Text style={styles.stepLabel}>{STEPS[currentStep - 1]}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    stepText: {
        fontSize: typography.sm,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.borderLight,
    },
    dotCompleted: {
        backgroundColor: colors.primary,
    },
    dotActive: {
        width: 24,
        backgroundColor: colors.primary,
    },
    stepLabel: {
        fontSize: typography.base,
        fontWeight: typography.semibold,
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
});

export default StepIndicator;
