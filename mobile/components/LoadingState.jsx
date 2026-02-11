/**
 * Loading State Component - Skeleton Cards
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const SkeletonCard = ({ delay = 0 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Animated.View style={[styles.logo, { opacity }]} />
                <View style={styles.orgInfo}>
                    <Animated.View style={[styles.skeletonLine, styles.lineShort, { opacity }]} />
                    <Animated.View style={[styles.skeletonLine, styles.lineXShort, { opacity }]} />
                </View>
            </View>

            {/* Title */}
            <Animated.View style={[styles.skeletonLine, styles.lineFull, { opacity }]} />
            <Animated.View style={[styles.skeletonLine, styles.lineMedium, { opacity }]} />

            {/* Tags */}
            <View style={styles.tagsRow}>
                <Animated.View style={[styles.skeletonTag, { opacity }]} />
                <Animated.View style={[styles.skeletonTag, { opacity }]} />
                <Animated.View style={[styles.skeletonTag, { opacity }]} />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Animated.View style={[styles.skeletonBadge, { opacity }]} />
                <Animated.View style={[styles.skeletonButton, { opacity }]} />
            </View>
        </View>
    );
};

const LoadingState = ({ count = 3 }) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} delay={index * 200} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    header: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.borderLight,
    },
    orgInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: spacing.xs,
    },
    skeletonLine: {
        height: 12,
        backgroundColor: colors.borderLight,
        borderRadius: borderRadius.sm,
    },
    lineFull: {
        width: '100%',
        marginBottom: spacing.sm,
    },
    lineMedium: {
        width: '65%',
        marginBottom: spacing.lg,
    },
    lineShort: {
        width: '60%',
    },
    lineXShort: {
        width: '40%',
    },
    tagsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    skeletonTag: {
        width: 60,
        height: 16,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.borderLight,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    skeletonBadge: {
        width: 60,
        height: 24,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.borderLight,
    },
    skeletonButton: {
        width: 90,
        height: 32,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.borderLight,
    },
});

export default LoadingState;
