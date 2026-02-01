import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../styles/global';

/**
 * JobCard - Displays job summary in a card format
 */
export default function JobCard({ job }) {
    const router = useRouter();

    const handlePress = () => {
        router.push(`/job/${job._id}`);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Days until closing
    const getDaysLeft = (closingDate) => {
        if (!closingDate) return null;
        const now = new Date();
        const closing = new Date(closingDate);
        const diff = Math.ceil((closing - now) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const daysLeft = getDaysLeft(job.closingDate);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.orgBadge}>
                    <Text style={styles.orgInitial}>
                        {job.organization?.charAt(0) || '?'}
                    </Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={2}>
                        {job.title}
                    </Text>
                    <Text style={styles.organization} numberOfLines={1}>
                        {job.organization}
                    </Text>
                </View>
            </View>

            {/* Meta info */}
            <View style={styles.meta}>
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

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.postedDate}>
                    Posted: {formatDate(job.postedDate)}
                </Text>
                {daysLeft !== null && (
                    <View style={[
                        styles.daysLeftBadge,
                        daysLeft <= 3 && styles.urgent
                    ]}>
                        <Text style={styles.daysLeftText}>
                            {daysLeft === 0 ? 'Last day!' : `${daysLeft}d left`}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },

    header: {
        flexDirection: 'row',
        marginBottom: 12,
    },

    orgBadge: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    orgInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },

    headerText: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },

    organization: {
        fontSize: 14,
        color: colors.textSecondary,
    },

    meta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },

    chip: {
        backgroundColor: colors.surfaceLight,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },

    chipText: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    postedDate: {
        fontSize: 12,
        color: colors.textMuted,
    },

    daysLeftBadge: {
        backgroundColor: colors.success,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    urgent: {
        backgroundColor: colors.warning,
    },

    daysLeftText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
});
