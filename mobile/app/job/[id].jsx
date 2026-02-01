import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { getJobById } from '../../services/api';
import { colors } from '../../styles/global';

export default function JobDetailScreen() {
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch job details
    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getJobById(id);

                if (response?.success && response?.data) {
                    setJob(response.data);
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id]);

    // Open apply URL in browser
    const handleApply = async () => {
        if (job?.applyUrl) {
            await WebBrowser.openBrowserAsync(job.applyUrl);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Strip HTML tags from description
    const stripHtml = (html) => {
        if (!html) return '';
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading job details...</Text>
            </View>
        );
    }

    if (error || !job) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorIcon}>😞</Text>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error || 'Job not found'}</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: job.organization || 'Job Details'
                }}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.orgBadge}>
                        <Text style={styles.orgInitial}>
                            {job.organization?.charAt(0) || '?'}
                        </Text>
                    </View>

                    <Text style={styles.title}>{job.title}</Text>
                    <Text style={styles.organization}>{job.organization}</Text>

                    {/* Meta chips */}
                    <View style={styles.metaContainer}>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>📍 {job.location}</Text>
                        </View>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>💼 {job.category}</Text>
                        </View>
                        {job.experienceLevel !== 'Unknown' && (
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>⭐ {job.experienceLevel}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Dates */}
                <View style={styles.datesCard}>
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>Posted</Text>
                        <Text style={styles.dateValue}>{formatDate(job.postedDate)}</Text>
                    </View>
                    <View style={styles.dateDivider} />
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>Deadline</Text>
                        <Text style={[styles.dateValue, styles.deadlineText]}>
                            {formatDate(job.closingDate)}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.description}>
                        {stripHtml(job.description) || 'No description available.'}
                    </Text>
                </View>

                {/* Spacer for fixed button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Apply Button */}
            <View style={styles.applyContainer}>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApply}
                    activeOpacity={0.8}
                >
                    <Text style={styles.applyButtonText}>Apply Now →</Text>
                </TouchableOpacity>
                <Text style={styles.applyNote}>Opens in browser</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    contentContainer: {
        padding: 16,
    },

    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textSecondary,
    },

    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },

    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    errorText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    header: {
        alignItems: 'center',
        marginBottom: 24,
    },

    orgBadge: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    orgInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },

    organization: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 16,
    },

    metaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },

    chip: {
        backgroundColor: colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },

    chipText: {
        fontSize: 14,
        color: colors.textSecondary,
    },

    datesCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },

    dateItem: {
        flex: 1,
        alignItems: 'center',
    },

    dateDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },

    dateLabel: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 4,
    },

    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },

    deadlineText: {
        color: colors.warning,
    },

    section: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },

    description: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
    },

    applyContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    applyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },

    applyButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },

    applyNote: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 6,
    },
});
