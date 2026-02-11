/**
 * Similar Jobs Component - Horizontal scrollable list of related jobs
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius, typography, getLogoColor } from '../theme';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

const SimilarJobs = ({ currentJobId, onJobPress }) => {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSimilarJobs();
    }, [currentJobId]);

    const fetchSimilarJobs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${currentJobId}/similar`);
            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch similar jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = (job) => {
        if (onJobPress) {
            onJobPress(job);
        } else {
            router.push(`/job/${job._id}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (jobs.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Similar Jobs</Text>
                <Text style={styles.count}>{jobs.length} found</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {jobs.map((job) => {
                    const logoColors = getLogoColor(job.organization || 'Job');
                    return (
                        <TouchableOpacity
                            key={job._id}
                            style={styles.card}
                            onPress={() => handlePress(job)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.logo, { backgroundColor: logoColors.bg }]}>
                                <Text style={[styles.logoText, { color: logoColors.text }]}>
                                    {job.organization?.charAt(0) || '?'}
                                </Text>
                            </View>
                            <Text style={styles.jobTitle} numberOfLines={2}>
                                {job.title}
                            </Text>
                            <Text style={styles.orgName} numberOfLines={1}>
                                {job.organization}
                            </Text>
                            <View style={styles.locationRow}>
                                <Feather name="map-pin" size={12} color={colors.textMuted} />
                                <Text style={styles.location} numberOfLines={1}>
                                    {job.location?.split(',')[0] || 'Ethiopia'}
                                </Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{job.category || 'General'}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    loadingContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    count: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    card: {
        width: 160,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginRight: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    logoText: {
        fontSize: 18,
        fontWeight: typography.bold,
    },
    jobTitle: {
        fontSize: typography.sm,
        fontWeight: typography.semibold,
        color: colors.textPrimary,
        marginBottom: 4,
        lineHeight: 18,
    },
    orgName: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.sm,
    },
    location: {
        fontSize: typography.xs,
        color: colors.textMuted,
        flex: 1,
    },
    badge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary,
    },
});

export default SimilarJobs;
