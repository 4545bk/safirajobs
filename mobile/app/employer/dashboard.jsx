/**
 * Employer Dashboard Screen
 * Shows stats, recent applications, and job management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    RefreshControl, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getEmployerDashboard, getStoredUser, getAnalyticsDaily } from '../../services/employerAuth';
import AnalyticsChart from '../../components/AnalyticsChart';

export default function EmployerDashboardScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    const loadDashboard = async () => {
        try {
            setError(null);
            const [userData, dashboardData, dailyData] = await Promise.all([
                getStoredUser(),
                getEmployerDashboard(),
                getAnalyticsDaily()
            ]);

            setUser(userData?.user);

            if (dashboardData.success) {
                setDashboard(dashboardData.data);
            } else {
                setError(dashboardData.message || 'Failed to load dashboard');
            }

            if (dailyData?.success) {
                setChartData(dailyData.data);
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </SafeAreaView>
        );
    }

    const stats = dashboard?.stats || {};
    const applications = dashboard?.applicationsByStatus || {};
    const topJobs = dashboard?.topJobs || [];
    const recentApps = dashboard?.recentApplications || [];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.companyName}>
                        {user?.profile?.company || user?.profile?.name || 'Employer'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => router.push('/employer/settings')}
                >
                    <Feather name="settings" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {error ? (
                    <View style={styles.errorBox}>
                        <Feather name="alert-circle" size={24} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={loadDashboard}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: '#EBF5FF' }]}>
                                <Feather name="briefcase" size={24} color={colors.primary} />
                                <Text style={styles.statNumber}>{stats.totalJobs || 0}</Text>
                                <Text style={styles.statLabel}>Total Jobs</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
                                <Feather name="check-circle" size={24} color="#10B981" />
                                <Text style={styles.statNumber}>{stats.activeJobs || 0}</Text>
                                <Text style={styles.statLabel}>Active Jobs</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                                <Feather name="eye" size={24} color="#F59E0B" />
                                <Text style={styles.statNumber}>{stats.totalViews || 0}</Text>
                                <Text style={styles.statLabel}>Total Views</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
                                <Feather name="users" size={24} color="#EC4899" />
                                <Text style={styles.statNumber}>{stats.totalApplications || 0}</Text>
                                <Text style={styles.statLabel}>Applications</Text>
                            </View>
                        </View>

                        {/* Analytics Chart */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Performance Trend</Text>
                            <AnalyticsChart
                                data={chartData?.datasets?.[0]?.data || []}
                                labels={chartData?.labels || []}
                            />
                        </View>

                        {/* Conversion Rate */}
                        <View style={styles.conversionCard}>
                            <View style={styles.conversionHeader}>
                                <Text style={styles.conversionLabel}>Conversion Rate</Text>
                                <Feather name="trending-up" size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.conversionValue}>{stats.conversionRate || 0}%</Text>
                            <Text style={styles.conversionHint}>Views → Applications</Text>
                        </View>

                        {/* Application Status Breakdown */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Application Pipeline</Text>
                            <View style={styles.pipelineGrid}>
                                {[
                                    { key: 'applied', label: 'Applied', color: '#3B82F6' },
                                    { key: 'reviewing', label: 'Reviewing', color: '#F59E0B' },
                                    { key: 'interview', label: 'Interview', color: '#8B5CF6' },
                                    { key: 'offered', label: 'Offered', color: '#10B981' },
                                    { key: 'hired', label: 'Hired', color: '#059669' },
                                    { key: 'rejected', label: 'Rejected', color: '#EF4444' },
                                ].map(item => (
                                    <View key={item.key} style={styles.pipelineItem}>
                                        <View style={[styles.pipelineDot, { backgroundColor: item.color }]} />
                                        <Text style={styles.pipelineCount}>{applications[item.key] || 0}</Text>
                                        <Text style={styles.pipelineLabel}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Top Performing Jobs */}
                        {topJobs.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Top Performing Jobs</Text>
                                {topJobs.map((job, index) => (
                                    <TouchableOpacity
                                        key={job.id}
                                        style={styles.topJobCard}
                                        onPress={() => router.push(`/employer/job/${job.id}`)}
                                    >
                                        <View style={styles.rankBadge}>
                                            <Text style={styles.rankText}>#{index + 1}</Text>
                                        </View>
                                        <View style={styles.topJobInfo}>
                                            <Text style={styles.topJobTitle} numberOfLines={1}>
                                                {job.title}
                                            </Text>
                                            <View style={styles.topJobStats}>
                                                <Text style={styles.topJobStat}>
                                                    <Feather name="eye" size={12} /> {job.views}
                                                </Text>
                                                <Text style={styles.topJobStat}>
                                                    <Feather name="users" size={12} /> {job.applications}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: job.status === 'active' ? '#D1FAE5' : '#FEE2E2' }
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: job.status === 'active' ? '#059669' : '#DC2626' }
                                            ]}>
                                                {job.status}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Quick Actions */}
                        <View style={styles.actionsSection}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => router.push('/employer/post-job')}
                            >
                                <Feather name="plus-circle" size={24} color="white" />
                                <Text style={styles.actionBtnText}>Post New Job</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.actionBtnOutline]}
                                onPress={() => router.push('/employer/my-jobs')}
                            >
                                <Feather name="list" size={24} color={colors.primary} />
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                                    Manage Jobs
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 100 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    loadingText: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    greeting: { fontSize: 14, color: colors.textSecondary },
    companyName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    profileBtn: { padding: 8 },

    content: { flex: 1, padding: spacing.md },

    errorBox: {
        backgroundColor: '#FEE2E2',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center' },
    retryText: { color: colors.primary, fontWeight: '600' },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statNumber: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

    conversionCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    conversionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    conversionLabel: { fontSize: 14, color: colors.textSecondary },
    conversionValue: { fontSize: 42, fontWeight: '700', color: colors.primary, marginTop: 8 },
    conversionHint: { fontSize: 12, color: colors.textMuted },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },

    pipelineGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pipelineItem: {
        width: '33%',
        alignItems: 'center',
        marginBottom: 16,
    },
    pipelineDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
    pipelineCount: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    pipelineLabel: { fontSize: 11, color: colors.textSecondary },

    topJobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: { color: 'white', fontSize: 12, fontWeight: '700' },
    topJobInfo: { flex: 1, marginLeft: 12 },
    topJobTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    topJobStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
    topJobStat: { fontSize: 12, color: colors.textSecondary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

    actionsSection: { gap: 12 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    actionBtnOutline: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    actionBtnText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
