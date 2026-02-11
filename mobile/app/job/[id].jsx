/**
 * Job Detail Screen - Clean Professional Design
 * Matches the Figma reference with tabs layout
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Share,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getJobById } from '../../services/api';
import { toggleBookmark, isBookmarked } from '../../services/bookmarks';
import { colors, spacing, borderRadius, typography, getLogoColor } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { trackJobView } from '../../services/analytics';
import ApplyModal from '../../components/ApplyModal';
import MatchBadge from '../../components/MatchBadge';
import MatchExplanation from '../../components/MatchExplanation';

const { width } = Dimensions.get('window');

// Tab options
const TABS = ['Overview', 'Description', 'Company'];

export default function JobDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDark } = useTheme();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookmarked, setBookmarked] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showMatchExplanation, setShowMatchExplanation] = useState(false);

    // Animation refs
    const headerAnim = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(0)).current;
    const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;

    // Fetch job details
    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getJobById(id);

                if (response?.success && response?.data) {
                    setJob(response.data);
                    const isMarked = await isBookmarked(response.data._id);
                    setBookmarked(isMarked);

                    // Track view (analytics)
                    trackJobView(response.data._id, 'app_detail');

                    // Run entrance animations
                    Animated.stagger(100, [
                        Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
                        Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
                        Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
                        Animated.spring(buttonAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
                    ]).start();
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

    // Handle tab change with animation
    const handleTabChange = (tab) => {
        const tabIndex = TABS.indexOf(tab);
        Animated.spring(tabIndicatorAnim, { toValue: tabIndex, tension: 80, friction: 12, useNativeDriver: true }).start();
        setActiveTab(tab);
    };

    // Open apply modal instead of directly opening browser
    const handleApply = () => {
        setShowApplyModal(true);
    };

    // Handle successful application
    const handleApplicationSubmitted = () => {
        // Could trigger a refresh or show notification
        console.log('Application submitted for', job?.title);
    };

    // Handle bookmark
    const handleBookmark = async () => {
        if (job?._id) {
            const isNowBookmarked = await toggleBookmark(job._id);
            setBookmarked(isNowBookmarked);
        }
    };

    // Handle share
    const handleShare = async () => {
        if (job) {
            try {
                await Share.share({
                    message: `Check out this job: ${job.title} at ${job.organization}\n${job.applyUrl || ''}`,
                    title: job.title,
                });
            } catch (error) {
                console.error('Share error:', error);
            }
        }
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

    // Extract job type tags
    const getJobTags = () => {
        const tags = [];
        if (job?.experienceLevel) tags.push(job.experienceLevel);
        if (job?.type) tags.push(job.type);
        else tags.push('On-site');
        if (job?.duration) tags.push(job.duration);
        else tags.push('Permanent');
        return tags.slice(0, 3);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
                <View style={styles.loadingIcon}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading job details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !job) {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
                <View style={styles.errorIconContainer}>
                    <Feather name="alert-circle" size={48} color={colors.primary} />
                </View>
                <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Oops!</Text>
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || 'Job not found'}</Text>
                <TouchableOpacity style={[styles.backBtnError, { backgroundColor: colors.surfaceHover }]} onPress={() => router.back()}>
                    <Text style={[styles.backBtnErrorText, { color: colors.textPrimary }]}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView >
        );
    }

    const logoColor = getLogoColor(job.organization);
    const tabWidth = (width - 48) / 3;
    const translateX = tabIndicatorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, tabWidth, tabWidth * 2],
    });

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <Animated.View style={{ opacity: contentAnim }}>
                        <Text style={[styles.overviewText, { color: colors.textSecondary }]}>
                            {stripHtml(job.description?.substring(0, 200)) || 'We are looking for a talented professional to join our team.'}
                            {job.description?.length > 200 ? '...' : ''}
                        </Text>

                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Minimum qualifications:</Text>
                        <View style={styles.bulletList}>
                            <View style={styles.bulletItem}>
                                <Text style={[styles.bulletDot, { color: colors.textPrimary }]}>•</Text>
                                <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                                    Bachelor's degree in {job.category || 'relevant field'} or equivalent practical experience
                                </Text>
                            </View>
                            <View style={styles.bulletItem}>
                                <Text style={[styles.bulletDot, { color: colors.textPrimary }]}>•</Text>
                                <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                                    Experience working with multidisciplinary teams and cross-functional stakeholders throughout the {job.category?.toLowerCase() || 'project'} process.
                                </Text>
                            </View>
                            <View style={styles.bulletItem}>
                                <Text style={[styles.bulletDot, { color: colors.textPrimary }]}>•</Text>
                                <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                                    A portfolio that demonstrates refined digital product {job.category?.toLowerCase() || 'work'} across multiple projects
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About the job:</Text>
                        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                            At {job.organization}, we follow a simple but vital premise: "Focus on the user and all else will follow." Our team takes complex tasks and makes them intuitive and accessible. We're looking for individuals who can bring fresh perspectives and innovative solutions.
                        </Text>
                    </Animated.View>
                );
            case 'Description':
                return (
                    <Animated.View style={{ opacity: contentAnim }}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Full Job Description:</Text>
                        <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                            {stripHtml(job.description) || 'No detailed description available for this position.'}
                        </Text>

                        {job.requirements && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Requirements:</Text>
                                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{job.requirements}</Text>
                            </>
                        )}
                    </Animated.View>
                );
            case 'Company':
                return (
                    <Animated.View style={{ opacity: contentAnim }}>
                        <View style={[styles.companyHeader, { backgroundColor: colors.surface }]}>
                            <View style={[styles.companyLogo, { backgroundColor: logoColor.bg }]}>
                                <Text style={[styles.companyLogoText, { color: logoColor.text }]}>
                                    {job.organization?.charAt(0) || '?'}
                                </Text>
                            </View>
                            <View style={styles.companyInfo}>
                                <Text style={[styles.companyName, { color: colors.textPrimary }]}>{job.organization}</Text>
                                <Text style={[styles.companyLocation, { color: colors.textSecondary }]}>{job.location}</Text>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About {job.organization}:</Text>
                        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                            {job.organization} is a leading organization in the {job.category || 'humanitarian'} sector, dedicated to making a positive impact in communities. With offices across {job.location}, they work tirelessly to create meaningful change and provide opportunities for growth and development.
                        </Text>
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <Animated.View style={[
                styles.header,
                { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }
            ]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={handleBookmark} activeOpacity={0.7}>
                    <Feather name="bookmark" size={24} color={bookmarked ? colors.primary : colors.textPrimary} fill={bookmarked ? colors.primary : 'none'} />
                </TouchableOpacity>
            </Animated.View>

            <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
                {/* Job Card - Horizontal Layout with Logo Left */}
                <Animated.View style={[
                    styles.jobCard,
                    {
                        backgroundColor: colors.surface,
                        opacity: cardAnim,
                        transform: [
                            { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
                            { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                        ]
                    }
                ]}>
                    {/* Top Row: Logo + Info */}
                    <View style={styles.cardTopRow}>
                        {/* Company Logo - White box on left */}
                        <View style={[styles.logoContainer, { backgroundColor: isDark ? '#333' : 'white' }]}>
                            <Text style={[styles.logoText, { color: logoColor.text }]}>
                                {job.organization?.charAt(0) || 'G'}
                            </Text>
                        </View>

                        {/* Job Info - Right of logo */}
                        <View style={styles.jobInfo}>
                            <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
                            <Text style={styles.companyLink}>
                                {job.organization} <Text style={styles.locationDivider}>|</Text> {job.location}
                            </Text>
                            {/* Match Badge */}
                            {job.matchData && (
                                <TouchableOpacity
                                    onPress={() => setShowMatchExplanation(true)}
                                    style={{ marginTop: 8 }}
                                >
                                    <MatchBadge score={job.matchData.score} size="small" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Tags Row - Below */}
                    <View style={styles.tagsRow}>
                        {getJobTags().map((tag, index) => (
                            <View key={index} style={[styles.tag, { borderColor: colors.border }]}>
                                <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Tabs */}
                <Animated.View style={[styles.tabsContainer, { opacity: contentAnim }]}>
                    <View style={[styles.tabsWrapper, { borderBottomColor: colors.borderLight }]}>
                        {/* Animated underline */}
                        <Animated.View style={[styles.tabIndicator, { width: tabWidth, transform: [{ translateX }], backgroundColor: colors.textPrimary }]} />

                        {TABS.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, { width: tabWidth }]}
                                onPress={() => handleTabChange(tab)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.tabText, { color: activeTab === tab ? colors.textPrimary : colors.textMuted }]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {renderTabContent()}
                </View>

                {/* Spacer for fixed button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Apply Button */}
            <Animated.View style={[
                styles.applyContainer,
                {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.borderLight,
                    opacity: buttonAnim,
                    transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }]
                }
            ]}>
                <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={handleApply} activeOpacity={0.9}>
                    <Text style={[styles.applyButtonText, { color: 'white' }]}>Apply Now</Text>
                </TouchableOpacity>
            </Animated.View>

            <ApplyModal
                visible={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                job={job}
                onApplicationSubmitted={handleApplicationSubmitted}
            />

            <MatchExplanation
                visible={showMatchExplanation}
                onClose={() => setShowMatchExplanation(false)}
                matchData={job?.matchData}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centerContainer: { flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingIcon: { marginBottom: 16 },
    loadingText: { fontSize: 15, color: '#6B7280' },
    errorIconContainer: { marginBottom: 16 },
    errorTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
    errorText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
    backBtnError: { paddingHorizontal: 32, paddingVertical: 14, backgroundColor: '#1F2937', borderRadius: 12 },
    backBtnErrorText: { color: 'white', fontSize: 15, fontWeight: '600' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
    headerBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Scroll Content
    scrollContent: { flex: 1 },
    scrollContentContainer: { paddingHorizontal: 20 },

    // Job Card - Beige background with horizontal layout
    jobCard: {
        backgroundColor: '#F5F1EB',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 18,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    logoText: { fontSize: 28, fontWeight: '700' },
    jobInfo: { flex: 1, justifyContent: 'center' },
    jobTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 6, lineHeight: 24 },
    companyLink: { fontSize: 15, color: colors.primary, fontWeight: '500' },
    locationDivider: { color: '#9CA3AF', fontWeight: '400' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tag: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0DCD6',
        backgroundColor: 'transparent',
    },
    tagText: { fontSize: 14, color: '#374151', fontWeight: '500' },

    // Tabs
    tabsContainer: { marginBottom: 24 },
    tabsWrapper: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', position: 'relative' },
    tab: { paddingVertical: 14, alignItems: 'center' },
    tabText: { fontSize: 15, color: '#9CA3AF', fontWeight: '500' },
    tabTextActive: { color: '#1F2937', fontWeight: '600' },
    tabIndicator: { position: 'absolute', bottom: 0, height: 2, backgroundColor: '#1F2937' },

    // Tab Content
    tabContent: { paddingBottom: 20 },
    overviewText: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 14, marginTop: 8 },
    bulletList: { gap: 14, marginBottom: 24 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    bulletDot: { fontSize: 18, color: '#1F2937', marginTop: -2 },
    bulletText: { flex: 1, fontSize: 15, color: '#6B7280', lineHeight: 22 },
    aboutText: { fontSize: 15, color: '#6B7280', lineHeight: 24 },
    descriptionText: { fontSize: 15, color: '#6B7280', lineHeight: 24 },

    // Company Tab
    companyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 16, backgroundColor: 'white', borderRadius: 12 },
    companyLogo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    companyLogoText: { fontSize: 20, fontWeight: '700' },
    companyInfo: { flex: 1 },
    companyName: { fontSize: 17, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
    companyLocation: { fontSize: 14, color: '#6B7280' },

    // Apply Button
    applyContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    applyButton: {
        backgroundColor: '#1F2937',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
