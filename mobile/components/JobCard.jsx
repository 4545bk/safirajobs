/**
 * JobCard Component - Mixed Figma Design
 * Circular logo, org first, salary display, ratings
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, getLogoColor } from '../theme';
import MatchBadge from './MatchBadge';

const JobCard = ({ job, onPress, onBookmark, isBookmarked = false, colors: themeColors }) => {
    // Falback to static if not provided (though Home provides it)
    const activeColors = themeColors || colors;

    // Get logo color from active theme
    const logoColorIndex = (job.organization?.charCodeAt(0) || 0) % (activeColors.logoColors?.length || 8);
    const logoColor = activeColors.logoColors ? activeColors.logoColors[logoColorIndex] : getLogoColor(job.organization);

    // Format posted time
    const getPostedTime = () => {
        if (!job.postedDate) return 'Recently';
        const posted = new Date(job.postedDate);
        const now = new Date();
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Get experience level display
    const getExperienceLabel = () => {
        const level = job.experienceLevel?.toLowerCase();
        if (level === 'entry' || level === 'junior') return 'Beginner';
        if (level === 'mid' || level === 'intermediate') return 'Intermediate';
        if (level === 'senior') return 'Advanced';
        if (level === 'expert' || level === 'lead') return 'Expert';
        return job.experienceLevel || 'Entry Level';
    };

    // Get job type
    const getJobType = () => {
        return job.experienceLevel === 'Entry' ? 'Internship' : 'Full Time';
    };

    // Random rating for display
    const getRating = () => {
        const ratings = [3.8, 4.0, 4.2, 4.5, 4.6, 4.8];
        const index = (job.organization?.charCodeAt(0) || 0) % ratings.length;
        return ratings[index];
    };

    const isFeatured = job.title?.toLowerCase().includes('senior') ||
        job.organization?.toLowerCase().includes('unicef') ||
        job.organization?.toLowerCase().includes('who');

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: activeColors.surface,
                    borderColor: activeColors.borderLight,
                    shadowColor: activeColors.shadowColor || '#000'
                }
            ]}
            onPress={onPress}
            activeOpacity={0.95}
        >
            {/* Header: Logo + Org Info + Bookmark */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Circular Organization Logo */}
                    <View style={[styles.logo, { backgroundColor: logoColor.bg }]}>
                        <Text style={[styles.logoText, { color: logoColor.text }]}>
                            {job.organization?.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    {/* Org Info */}
                    <View style={styles.orgInfo}>
                        <View style={styles.orgNameRow}>
                            <Text style={[styles.orgName, { color: activeColors.textPrimary }]} numberOfLines={1}>
                                {job.organization}
                            </Text>
                            <View style={[styles.verifiedBadge, { backgroundColor: activeColors.primary }]}>
                                <Feather name="check" size={8} color="white" />
                            </View>
                        </View>
                        <View style={styles.locationRow}>
                            <Feather name="map-pin" size={10} color={activeColors.textMuted} />
                            <Text style={[styles.locationText, { color: activeColors.textMuted }]} numberOfLines={1}>{job.location}</Text>
                        </View>
                    </View>
                </View>

                {/* Match Badge (New) */}
                {job.matchData && (
                    <View style={{ marginRight: 8 }}>
                        <MatchBadge score={job.matchData.score} />
                    </View>
                )}

                {/* Bookmark Button */}
                <TouchableOpacity
                    style={styles.bookmarkBtn}
                    onPress={(e) => {
                        e.stopPropagation();
                        onBookmark && onBookmark(job);
                    }}
                >
                    <Feather
                        name="bookmark"
                        size={22}
                        color={isBookmarked ? activeColors.primary : activeColors.textMuted}
                    />
                </TouchableOpacity>
            </View>

            {/* Job Title */}
            <Text style={[styles.jobTitle, { color: activeColors.textPrimary }]} numberOfLines={2}>{job.title}</Text>

            {/* Meta Tags Row */}
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Feather name="briefcase" size={12} color={activeColors.textMuted} />
                    <Text style={[styles.metaText, { color: activeColors.textMuted }]}>{getJobType()}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color={activeColors.textMuted} />
                    <Text style={[styles.metaText, { color: activeColors.textMuted }]}>{getPostedTime()}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.metaText, { color: activeColors.textMuted }]}>{getRating()}</Text>
                </View>
            </View>

            {/* Footer: Experience Level + Featured + Apply */}
            <View style={styles.footer}>
                <View style={[styles.experienceBadge, { backgroundColor: activeColors.primary + '15' }]}>
                    <Text style={[styles.experienceText, { color: activeColors.primary }]}>
                        Experience: {getExperienceLabel()}
                    </Text>
                </View>

                <View style={styles.footerRight}>
                    {isFeatured && (
                        <Text style={[styles.featuredBadge, { color: activeColors.primary }]}>Featured</Text>
                    )}
                    <TouchableOpacity style={[styles.applyBtn, { backgroundColor: activeColors.primary }]} onPress={onPress}>
                        <Text style={[styles.applyBtnText, { color: 'white' }]}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity >
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        gap: spacing.md,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 22, // Circular
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
    },
    orgInfo: {
        flex: 1,
    },
    orgNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    orgName: {
        fontSize: typography.base,
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    verifiedBadge: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    locationText: {
        fontSize: typography.xs,
        color: colors.textMuted,
    },
    bookmarkBtn: {
        padding: spacing.xs,
    },
    jobTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: typography.xs,
        color: colors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    experienceBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.sm,
    },
    experienceText: {
        fontSize: typography.sm,
        fontWeight: typography.semibold,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    featuredBadge: {
        fontSize: typography.sm,
        fontWeight: typography.semibold,
        color: colors.primary,
    },
    applyBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
        borderRadius: borderRadius.sm,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    applyBtnText: {
        color: colors.textOnPrimary,
        fontSize: typography.sm,
        fontWeight: typography.semibold,
    },
});

export default JobCard;
