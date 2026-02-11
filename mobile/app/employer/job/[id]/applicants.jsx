/**
 * View Applicants Screen (Employer)
 * View and manage applicants for a job
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    SafeAreaView, StatusBar, RefreshControl, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../../../../theme';
import { getJobApplicants, updateApplicantStatus } from '../../../../services/employerAuth';

const STATUS_OPTIONS = [
    { key: 'applied', label: 'Applied', color: '#3B82F6', icon: 'inbox' },
    { key: 'reviewing', label: 'Reviewing', color: '#F59E0B', icon: 'eye' },
    { key: 'interview', label: 'Interview', color: '#8B5CF6', icon: 'calendar' },
    { key: 'offered', label: 'Offered', color: '#10B981', icon: 'check-circle' },
    { key: 'hired', label: 'Hired', color: '#059669', icon: 'award' },
    { key: 'rejected', label: 'Rejected', color: '#EF4444', icon: 'x-circle' },
];

export default function ApplicantsScreen() {
    const router = useRouter();
    const { id: jobId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const loadApplicants = async () => {
        try {
            const result = await getJobApplicants(jobId);
            if (result.success) {
                setJob(result.data.job);
                setApplicants(result.data.applicants);
            }
        } catch (error) {
            console.error('Load applicants error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadApplicants();
    }, [jobId]);

    const handleStatusChange = async (status) => {
        if (!selectedApplicant) return;

        try {
            const result = await updateApplicantStatus(selectedApplicant._id, status);
            if (result.success) {
                setApplicants(applicants.map(a =>
                    a._id === selectedApplicant._id ? { ...a, status } : a
                ));
                setShowStatusModal(false);
                setSelectedApplicant(null);
            } else {
                Alert.alert('Error', result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Network error');
        }
    };

    const getStatusStyle = (status) => {
        const option = STATUS_OPTIONS.find(o => o.key === status) || STATUS_OPTIONS[0];
        return option;
    };

    const renderApplicant = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={styles.applicantCard}>
                <View style={styles.applicantHeader}>
                    <View style={styles.avatar}>
                        <Feather name="user" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.applicantInfo}>
                        <Text style={styles.applicantEmail}>{item.applicantEmail || 'No email'}</Text>
                        {item.applicantPhone && (
                            <Text style={styles.applicantPhone}>{item.applicantPhone}</Text>
                        )}
                        <Text style={styles.applyDate}>
                            Applied: {new Date(item.appliedDate).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {item.hasResume && (
                    <View style={styles.resumeRow}>
                        <Feather name="file-text" size={16} color={colors.primary} />
                        <Text style={styles.resumeName}>{item.resumeName || 'Resume attached'}</Text>
                    </View>
                )}

                {item.coverLetter && (
                    <View style={styles.coverLetterBox}>
                        <Text style={styles.coverLetterLabel}>Cover Letter</Text>
                        <Text style={styles.coverLetterText} numberOfLines={3}>
                            {item.coverLetter}
                        </Text>
                    </View>
                )}

                <View style={styles.applicantFooter}>
                    <TouchableOpacity
                        style={[styles.statusBtn, { backgroundColor: statusStyle.color + '20' }]}
                        onPress={() => {
                            setSelectedApplicant(item);
                            setShowStatusModal(true);
                        }}
                    >
                        <Feather name={statusStyle.icon} size={14} color={statusStyle.color} />
                        <Text style={[styles.statusBtnText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                        <Feather name="chevron-down" size={14} color={statusStyle.color} />
                    </TouchableOpacity>

                    {item.notes && (
                        <TouchableOpacity style={styles.notesBtn}>
                            <Feather name="message-square" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
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
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Applicants</Text>
                    {job && (
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {job.title}
                        </Text>
                    )}
                </View>
                <View style={{ width: 32 }} />
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <Text style={styles.statsText}>
                    <Text style={styles.statsNumber}>{applicants.length}</Text> applicant(s)
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={applicants}
                    keyExtractor={(item) => item._id}
                    renderItem={renderApplicant}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadApplicants(); }}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="users" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No applicants yet</Text>
                            <Text style={styles.emptySubtext}>
                                Share your job posting to get more applications
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Status Change Modal */}
            <Modal
                visible={showStatusModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Status</Text>
                            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                <Feather name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {STATUS_OPTIONS.map(option => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.statusOption,
                                    selectedApplicant?.status === option.key && styles.statusOptionActive
                                ]}
                                onPress={() => handleStatusChange(option.key)}
                            >
                                <Feather name={option.icon} size={20} color={option.color} />
                                <Text style={styles.statusOptionText}>{option.label}</Text>
                                {selectedApplicant?.status === option.key && (
                                    <Feather name="check" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { padding: 4 },
    headerContent: { flex: 1, marginLeft: 12 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    headerSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    statsBar: {
        padding: spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    statsText: { fontSize: 14, color: colors.textSecondary },
    statsNumber: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: spacing.md },

    applicantCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    applicantHeader: { flexDirection: 'row', marginBottom: 12 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EBF5FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    applicantInfo: { flex: 1, marginLeft: 12 },
    applicantEmail: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    applicantPhone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    applyDate: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

    resumeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        backgroundColor: '#EBF5FF',
        borderRadius: 8,
        marginBottom: 12,
    },
    resumeName: { fontSize: 13, color: colors.primary },

    coverLetterBox: {
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginBottom: 12,
    },
    coverLetterLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
    coverLetterText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

    applicantFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 10,
        borderRadius: 8,
    },
    statusBtnText: { fontSize: 13, fontWeight: '600' },
    notesBtn: { padding: 10, backgroundColor: '#F3F4F6', borderRadius: 8 },

    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 12 },
    emptySubtext: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: 'center' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },

    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
    },
    statusOptionActive: { backgroundColor: '#EBF5FF' },
    statusOptionText: { flex: 1, fontSize: 15, color: colors.textPrimary },
});
