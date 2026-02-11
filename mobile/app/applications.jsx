/**
 * Applications Tracking Screen
 * Track and manage job application status
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import * as appService from '../services/applications';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';

const STATUS_CONFIG = {
    saved: { label: 'Saved', icon: 'bookmark', color: '#6B7280' },
    applied: { label: 'Applied', icon: 'send', color: '#3B82F6' },
    interview: { label: 'Interview', icon: 'calendar', color: '#8B5CF6' },
    offer: { label: 'Offer', icon: 'gift', color: '#10B981' },
    hired: { label: 'Hired', icon: 'checkmark-circle', color: '#059669' },
    rejected: { label: 'Rejected', icon: 'close-circle', color: '#EF4444' },
    withdrawn: { label: 'Withdrawn', icon: 'arrow-undo', color: '#9CA3AF' }
};

const StatusPill = ({ status, active, onPress }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.saved;
    return (
        <TouchableOpacity
            style={[styles.statusPill, active && { backgroundColor: config.color }]}
            onPress={onPress}
        >
            <Ionicons name={config.icon} size={14} color={active ? 'white' : config.color} />
            <Text style={[styles.statusPillText, active && { color: 'white' }]}>{config.label}</Text>
        </TouchableOpacity>
    );
};

const ApplicationCard = ({ app, onStatusChange, onDelete, onViewJob, colors: themeColors, t, getStatusLabel }) => {
    const activeColors = themeColors || colors;
    const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.saved;
    const job = app.jobId || app.jobSnapshot;

    return (
        <View style={[styles.card, { backgroundColor: activeColors.surface, shadowColor: activeColors.shadowColor || '#000' }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
                    <Ionicons name={config.icon} size={14} color={config.color} />
                    <Text style={[styles.statusBadgeText, { color: config.color }]}>{getStatusLabel ? getStatusLabel(app.status) : config.label}</Text>
                </View>
                {app.appliedDate && (
                    <Text style={[styles.dateText, { color: activeColors.textSecondary }]}>
                        {new Date(app.appliedDate).toLocaleDateString()}
                    </Text>
                )}
            </View>

            <TouchableOpacity onPress={() => onViewJob(app.jobId?._id || app.jobId)}>
                <Text style={[styles.jobTitle, { color: activeColors.textPrimary }]}>{job?.title || 'Unknown Position'}</Text>
                <Text style={[styles.jobOrg, { color: activeColors.textSecondary }]}>{job?.organization || 'Unknown Company'}</Text>
                <Text style={[styles.jobLocation, { color: activeColors.textSecondary }]}>📍 {job?.location || 'Unknown'}</Text>
            </TouchableOpacity>

            {app.notes && (
                <View style={[styles.notesSection, { backgroundColor: activeColors.surfaceHover }]}>
                    <Text style={[styles.notesLabel, { color: activeColors.textSecondary }]}>{t ? t('notes') : 'Notes'}:</Text>
                    <Text style={[styles.notesText, { color: activeColors.textPrimary }]}>{app.notes}</Text>
                </View>
            )}

            <View style={[styles.cardActions, { borderTopColor: activeColors.borderLight }]}>
                <Text style={[styles.updateLabel, { color: activeColors.textSecondary }]}>{t ? t('updateStatus') : 'Update Status'}:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {Object.keys(STATUS_CONFIG).slice(0, 5).map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.miniStatus, { backgroundColor: activeColors.surfaceHover }, app.status === status && { backgroundColor: STATUS_CONFIG[status].color }]}
                            onPress={() => onStatusChange(app._id, status)}
                        >
                            <Ionicons
                                name={STATUS_CONFIG[status].icon}
                                size={16}
                                color={app.status === status ? 'white' : STATUS_CONFIG[status].color}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(app._id)}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function ApplicationsScreen() {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({ total: 0, byStatus: {} });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deviceToken, setDeviceToken] = useState(null);

    const { colors: themeColors, isDark } = useTheme();
    const { t } = useLanguage();

    // Status labels function to get translated labels
    const getStatusLabel = (status) => {
        const key = `status_${status}`;
        const label = t(key);
        return label !== key ? label : STATUS_CONFIG[status]?.label || 'Unknown';
    };

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem('expoPushToken');
            setDeviceToken(token);

            if (token) {
                const [appsRes, statsRes] = await Promise.all([
                    appService.getApplications(token, filter),
                    appService.getApplicationStats(token)
                ]);

                if (appsRes.success) setApplications(appsRes.data);
                if (statsRes.success) setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const result = await appService.updateStatus(id, newStatus);
        if (result.success) {
            setApplications(apps => apps.map(a => a._id === id ? result.data : a));
            loadData(); // Refresh stats
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(t('removeApplication'), t('confirmRemoveApp'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('remove'), style: 'destructive',
                onPress: async () => {
                    const result = await appService.deleteApplication(id);
                    if (result.success) {
                        setApplications(apps => apps.filter(a => a._id !== id));
                        loadData();
                    }
                }
            }
        ]);
    };

    const handleViewJob = (jobId) => {
        if (jobId) router.push(`/job/${jobId}`);
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('myApplications')}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>{t('total')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.statNumber}>{stats.byStatus?.applied || 0}</Text>
                    <Text style={styles.statLabel}>{t('status_applied')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#8B5CF6' }]}>
                    <Text style={styles.statNumber}>{stats.byStatus?.interview || 0}</Text>
                    <Text style={styles.statLabel}>{t('status_interview')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#059669' }]}>
                    <Text style={styles.statNumber}>{stats.byStatus?.hired || 0}</Text>
                    <Text style={styles.statLabel}>{t('status_hired')}</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['all', ...Object.keys(STATUS_CONFIG)].map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterTab,
                            { backgroundColor: isDark ? themeColors.surfaceHover : '#F3F4F6' },
                            filter === status && { backgroundColor: themeColors.primary }
                        ]}
                        onPress={() => setFilter(status)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            { color: themeColors.textSecondary },
                            filter === status && { color: 'white', fontWeight: '500' }
                        ]}>
                            {status === 'all' ? t('all') : getStatusLabel(status)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {applications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="briefcase-outline" size={48} color={themeColors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>{t('noApplications')}</Text>
                        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                            {t('trackApplicationsHint')}
                        </Text>
                    </View>
                ) : (
                    applications.map((app, index) => (
                        <AnimatedEntry key={app._id} delay={index * 100}>
                            <ApplicationCard
                                app={app}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                onViewJob={handleViewJob}
                                colors={themeColors}
                                t={t}
                                getStatusLabel={getStatusLabel}
                            />
                        </AnimatedEntry>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
        backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
    },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
    statCard: {
        flex: 1, padding: 12, borderRadius: 12, alignItems: 'center'
    },
    statNumber: { fontSize: 20, fontWeight: '700', color: 'white' },
    statLabel: { fontSize: 11, color: 'white', opacity: 0.9 },
    filterScroll: { maxHeight: 44, paddingHorizontal: 16 },
    filterTab: {
        paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
        borderRadius: 20, backgroundColor: '#F3F4F6'
    },
    filterTabActive: { backgroundColor: colors.primary },
    filterTabText: { fontSize: 13, color: colors.textSecondary },
    filterTabTextActive: { color: 'white', fontWeight: '500' },
    content: { flex: 1, padding: 16 },
    card: {
        backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    statusBadgeText: { fontSize: 12, fontWeight: '500' },
    dateText: { fontSize: 12, color: colors.textSecondary },
    jobTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    jobOrg: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    jobLocation: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    notesSection: { marginTop: 12, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 8 },
    notesLabel: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
    notesText: { fontSize: 13, color: colors.textPrimary, marginTop: 2 },
    cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    updateLabel: { fontSize: 12, color: colors.textSecondary, marginRight: 8 },
    miniStatus: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    deleteBtn: { marginLeft: 'auto', padding: 6 },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 12 },
    emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 40 },
    statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6', marginRight: 8, gap: 4 },
    statusPillText: { fontSize: 13, color: colors.textSecondary }
});
