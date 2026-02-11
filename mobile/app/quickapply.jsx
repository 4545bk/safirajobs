/**
 * QuickApply Screen - Tinder-style Swipe to Apply
 * Enhanced with real application flow - opens apply URL after swipe
 */

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../theme';
import { getJobs } from '../services/api';
import { filterUnswipedJobs, applyToJob, rejectJob, getAppliedCount, clearSwipeHistory } from '../services/quickapply';
import { submitApplication } from '../services/applications';
import { loadApplyProfile, loadResumeInfo } from '../services/applyProfile';
import SwipeCard from '../components/SwipeCard';
import ApplyModal from '../components/ApplyModal';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuickApplyScreen() {
    const router = useRouter();
    const { isDark } = useTheme();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appliedCount, setAppliedCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Application Tracked!');

    // Apply modal state (only shown when no saved profile)
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // Cached profile ref (avoid loading from storage every swipe)
    const cachedProfile = useRef(null);
    const cachedResume = useRef(null);
    const profileChecked = useRef(false);

    // Load saved profile on focus
    const loadCachedProfile = async () => {
        try {
            cachedProfile.current = await loadApplyProfile();
            cachedResume.current = await loadResumeInfo();
            profileChecked.current = true;
        } catch (err) {
            console.warn('Failed to load profile:', err);
            profileChecked.current = true;
        }
    };

    // Theme colors - soft pink like Tinder
    const colors = {
        background: isDark ? '#1a1a2e' : '#FFF0F3',
        surface: isDark ? '#16213e' : '#FFFFFF',
        primary: '#FF6B6B',
        primaryLight: '#FFE0E3',
        textPrimary: isDark ? '#FFFFFF' : '#1A1A2E',
        textSecondary: isDark ? '#A0A0B0' : '#666680',
        textMuted: isDark ? '#707080' : '#9999AA',
        success: '#10B981',
    };

    // Load jobs
    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('QuickApply: Fetching jobs...');
            let allJobs = [];
            let page = 1;
            let hasMore = true;

            while (hasMore && page <= 5) {
                const result = await getJobs({ page, limit: 20 });
                const pageJobs = result.data?.jobs || result.jobs || [];
                allJobs = [...allJobs, ...pageJobs];

                const totalPages = result.data?.pagination?.pages || 1;
                hasMore = page < totalPages;
                page++;
            }

            console.log('QuickApply: Total jobs fetched:', allJobs.length);

            const unswipedJobs = await filterUnswipedJobs(allJobs);
            console.log('QuickApply: Unswiped jobs:', unswipedJobs.length);

            setJobs(unswipedJobs);
            const count = await getAppliedCount();
            setAppliedCount(count);

            // Pre-load profile for instant apply
            await loadCachedProfile();
        } catch (err) {
            console.error('QuickApply Error:', err);
            setError(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [])
    );

    // Quick-submit application using saved profile (no modal!)
    const quickSubmit = async (job) => {
        try {
            const profile = cachedProfile.current;
            const resume = cachedResume.current;

            // Read resume as base64 if available
            let resumeBase64 = null;
            if (resume?.uri) {
                try {
                    const base64 = await FileSystem.readAsStringAsync(resume.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    const mimeType = resume.mimeType || 'application/pdf';
                    resumeBase64 = `data:${mimeType};base64,${base64}`;
                } catch (err) {
                    console.warn('Failed to read cached resume:', err);
                }
            }

            const result = await submitApplication({
                deviceToken: 'quickapply-device',
                jobId: job._id || job.id,
                applicantName: profile.email.split('@')[0],
                applicantEmail: profile.email,
                applicantPhone: profile.phone || '',
                coverLetter: '',
                resumeBase64,
                resumeName: resume?.name,
            });

            if (result.success) {
                const msg = result.data?.emailSent
                    ? '📧 Application emailed!'
                    : '✅ Application tracked!';
                setSuccessMessage(msg);
            } else if (result.error === 'Already applied to this job') {
                setSuccessMessage('Already applied!');
            } else {
                setSuccessMessage('✅ Application tracked!');
            }
        } catch (err) {
            console.warn('Quick submit failed:', err);
            setSuccessMessage('✅ Tracked (offline)');
        }

        // Show success toast
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
    };

    // Handle swipe right (Apply)
    const handleSwipeRight = async (job) => {
        // Remove card immediately for smooth UX
        setJobs(prev => prev.filter(j => j._id !== job._id));
        setAppliedCount(prev => prev + 1);

        // Save to applied list locally
        applyToJob(job._id, {
            title: job.title,
            organization: job.organization,
            location: job.location,
            applyUrl: job.applyUrl,
            appliedAt: new Date().toISOString(),
        }).catch(err => console.warn('Failed to save apply:', err));

        // If profile is saved → instant submit! No modal needed.
        const hasProfile = cachedProfile.current && cachedProfile.current.email;
        if (hasProfile) {
            quickSubmit(job);
        } else {
            // First time → show the form modal
            setSelectedJob(job);
            setShowApplyModal(true);
        }
    };

    // Handle application submitted callback (from modal, first time only)
    const handleApplicationSubmitted = () => {
        setAppliedCount(prev => prev + 1);
        setSuccessMessage('✅ Application sent!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        // Reload cached profile for future quick submits
        loadCachedProfile();
    };

    // Handle modal close
    const handleModalClose = () => {
        setShowApplyModal(false);
        setSelectedJob(null);
    };

    // Handle swipe left (Reject) - non-blocking
    const handleSwipeLeft = (job) => {
        setJobs(prev => prev.filter(j => j._id !== job._id));
        rejectJob(job._id).catch(err => console.warn('Failed to save reject:', err));
    };

    // Handle save (bookmark)
    const handleSave = (job) => {
        // TODO: Implement bookmark functionality
        console.log('Saved job:', job._id);
    };

    // Handle view job details
    const handleViewDetails = (job) => {
        router.push(`/job/${job._id}`);
    };

    // Handle reset
    const handleReset = async () => {
        await clearSwipeHistory();
        setAppliedCount(0);
        loadJobs();
    };

    // ApplyModal is now a proper component imported above

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name="check-circle" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                All Caught Up! 🎉
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                You've swiped through all available jobs.{'\n'}Check back later for new opportunities!
            </Text>
            <TouchableOpacity
                style={[styles.refreshBtn, { backgroundColor: colors.primary }]}
                onPress={loadJobs}
            >
                <Feather name="refresh-cw" size={18} color="white" />
                <Text style={styles.refreshBtnText}>Refresh Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.resetBtn, { borderColor: colors.primary }]}
                onPress={handleReset}
            >
                <Feather name="rotate-ccw" size={16} color={colors.primary} />
                <Text style={[styles.resetBtnText, { color: colors.primary }]}>Reset Swipe History</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient
            colors={isDark ? ['#1a1a2e', '#16213e'] : ['#FFF0F3', '#FFE4E8', '#FFF0F3']}
            style={styles.container}
        >
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent
            />

            {/* Header */}
            <SafeAreaView style={styles.headerSafe}>
                <View style={[styles.header, {
                    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 10
                }]}>
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                        onPress={() => router.back()}
                    >
                        <Feather name="chevron-left" size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                            Discover
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {jobs.length} jobs available
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                        onPress={() => router.push('/applications')}
                    >
                        <Feather name="briefcase" size={20} color={colors.primary} />
                        {appliedCount > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.success }]}>
                                <Text style={styles.badgeText}>{appliedCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Card Stack */}
            <View style={styles.cardStackContainer}>
                {error && (
                    <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={48} color={colors.primary} />
                        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                            onPress={loadJobs}
                        >
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Finding jobs for you...
                        </Text>
                    </View>
                )}

                {!loading && !error && jobs.length === 0 && renderEmptyState()}

                {!loading && jobs.length > 0 && (
                    <>
                        {jobs.slice(0, 3).reverse().map((job, index) => (
                            <SwipeCard
                                key={job._id}
                                job={job}
                                isFirst={index === jobs.slice(0, 3).length - 1}
                                onSwipeLeft={handleSwipeLeft}
                                onSwipeRight={handleSwipeRight}
                                onSave={handleSave}
                                onPress={handleViewDetails}
                                themeColors={colors}
                            />
                        ))}
                    </>
                )}
            </View>

            {/* Success Toast */}
            {showSuccess && (
                <View style={styles.successToast}>
                    <Feather name="check-circle" size={20} color="white" />
                    <Text style={styles.successText}>{successMessage}</Text>
                </View>
            )}

            {/* Apply Modal */}
            <ApplyModal
                visible={showApplyModal}
                onClose={handleModalClose}
                job={selectedJob}
                onApplicationSubmitted={handleApplicationSubmitted}
                deviceToken="quickapply-device"
            />

            {/* Bottom Navigation - Same as Home */}
            <View style={[styles.bottomNav, { backgroundColor: colors.surface }]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
                    <Feather name="home" size={24} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="zap" size={24} color={colors.primary} />
                    <View style={[styles.navDot, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>

                {/* Center FAB - Applications Tracker */}
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/applications')}
                    >
                        <Feather name="briefcase" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/alerts')}>
                    <Feather name="bell" size={24} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>Alerts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
                    <Feather name="user" size={24} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSafe: {
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardStackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
    },
    errorContainer: {
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 15,
        textAlign: 'center',
    },
    retryBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 8,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 28,
        gap: 8,
        marginBottom: 12,
    },
    refreshBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 6,
    },
    resetBtnText: {
        fontSize: 14,
        fontWeight: '500',
    },
    successToast: {
        position: 'absolute',
        top: 100,
        left: 40,
        right: 40,
        backgroundColor: '#10B981',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 100,
    },
    successText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalJobTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    modalCompany: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    applyNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        marginBottom: 10,
    },
    applyNowText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
    },
    applyLaterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 6,
        marginBottom: 16,
    },
    applyLaterText: {
        fontSize: 15,
        fontWeight: '600',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    tipText: {
        fontSize: 12,
        flex: 1,
    },
    // Bottom nav styles
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        minWidth: 60,
    },
    navLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    navDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginTop: 3,
    },
    fabContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        marginTop: -30,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});
