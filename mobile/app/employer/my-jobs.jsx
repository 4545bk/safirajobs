/**
 * My Jobs Screen (Employer)
 * List and manage employer's job postings
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    SafeAreaView, StatusBar, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { getEmployerJobs, deleteJob } from '../../services/employerAuth';

const STATUS_COLORS = {
    active: { bg: '#D1FAE5', text: '#059669' },
    draft: { bg: '#FEF3C7', text: '#D97706' },
    closed: { bg: '#FEE2E2', text: '#DC2626' },
    expired: { bg: '#F3F4F6', text: '#6B7280' },
};

export default function MyJobsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filter, setFilter] = useState('all');

    const loadJobs = async () => {
        try {
            const result = await getEmployerJobs(filter);
            if (result.success) {
                setJobs(result.data.jobs);
            }
        } catch (error) {
            console.error('Load jobs error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [filter])
    );

    const handleDelete = (jobId, title) => {
        Alert.alert(
            'Delete Job',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteJob(jobId);
                        if (result.success) {
                            setJobs(jobs.filter(j => j._id !== jobId));
                        } else {
                            Alert.alert('Error', result.message || 'Failed to delete job');
                        }
                    },
                },
            ]
        );
    };

    const renderJob = ({ item }) => {
        const status = STATUS_COLORS[item.status] || STATUS_COLORS.active;

        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => router.push(`/employer/job/${item._id}`)}
            >
                <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.jobMeta}>
                    <View style={styles.metaItem}>
                        <Feather name="map-pin" size={14} color={colors.textMuted} />
                        <Text style={styles.metaText}>{item.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Feather name="calendar" size={14} color={colors.textMuted} />
                        <Text style={styles.metaText}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.jobStats}>
                    <View style={styles.stat}>
                        <Feather name="eye" size={16} color={colors.primary} />
                        <Text style={styles.statValue}>{item.viewCount || 0}</Text>
                        <Text style={styles.statLabel}>views</Text>
                    </View>
                    <View style={styles.stat}>
                        <Feather name="users" size={16} color="#10B981" />
                        <Text style={styles.statValue}>{item.applyCount || 0}</Text>
                        <Text style={styles.statLabel}>applies</Text>
                    </View>
                </View>

                <View style={styles.jobActions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push(`/employer/job/${item._id}/applicants`)}
                    >
                        <Feather name="users" size={16} color={colors.primary} />
                        <Text style={styles.actionBtnText}>Applicants</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push(`/employer/edit-job/${item._id}`)}
                    >
                        <Feather name="edit-2" size={16} color={colors.primary} />
                        <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtn]}
                        onPress={() => handleDelete(item._id, item.title)}
                    >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Jobs</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/employer/post-job')}
                >
                    <Feather name="plus" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
                {['all', 'active', 'draft', 'closed'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterPill, filter === f && styles.filterPillActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterPillText,
                            filter === f && styles.filterPillTextActive
                        ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderJob}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadJobs(); }}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="briefcase" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No jobs posted yet</Text>
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => router.push('/employer/post-job')}
                            >
                                <Text style={styles.emptyBtnText}>Post Your First Job</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    addBtn: { padding: 4 },

    filterRow: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: 8,
        backgroundColor: 'white',
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterPillActive: { backgroundColor: colors.primary },
    filterPillText: { fontSize: 13, color: colors.textSecondary },
    filterPillTextActive: { color: 'white', fontWeight: '600' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: spacing.md },

    jobCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginRight: 12 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

    jobMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: colors.textMuted },

    jobStats: { flexDirection: 'row', gap: 24, marginBottom: 12 },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    statLabel: { fontSize: 12, color: colors.textMuted },

    jobActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 10,
        backgroundColor: '#EBF5FF',
        borderRadius: 8,
    },
    actionBtnText: { fontSize: 13, fontWeight: '500', color: colors.primary },
    deleteBtn: { flex: 0, paddingHorizontal: 14, backgroundColor: '#FEE2E2' },

    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 12, marginBottom: 16 },
    emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    emptyBtnText: { fontSize: 14, fontWeight: '600', color: 'white' },
});
