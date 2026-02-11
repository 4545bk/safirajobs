/**
 * SwipeCard Component - Enhanced Tinder-style Swipeable Job Card
 * Shows detailed job info with colorful badges upfront
 */

import React, { useRef, memo, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    PanResponder,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius, typography, getLogoColor } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const SWIPE_OUT_DURATION = 200;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;

// Badge colors for different types
const BADGE_COLORS = {
    workType: { bg: '#E8F5E9', text: '#2E7D32' },      // Green
    jobType: { bg: '#FFF3E0', text: '#E65100' },       // Orange
    salary: { bg: '#FFF9C4', text: '#F9A825' },        // Yellow
    category: { bg: '#E3F2FD', text: '#1565C0' },      // Blue
    experience: { bg: '#F3E5F5', text: '#7B1FA2' },    // Purple
    education: { bg: '#ECEFF1', text: '#546E7A' },     // Grey
    location: { bg: '#FCE4EC', text: '#C2185B' },      // Pink
    startup: { bg: '#E0F7FA', text: '#00838F' },       // Cyan
};

const SwipeCard = ({
    job,
    onSwipeLeft,
    onSwipeRight,
    onSave,
    onPress,
    isFirst = false,
    themeColors,
}) => {
    const position = useRef(new Animated.ValueXY()).current;
    const swiping = useRef(false);

    // Memoize static values
    const logoColor = useMemo(() => getLogoColor(job.organization || 'Company'), [job.organization]);

    // Match score
    const matchScore = useMemo(() => {
        if (job.matchScore) return job.matchScore;
        if (job.matchData?.score) return job.matchData.score;
        const baseScore = 70;
        const orgBonus = (job.organization?.charCodeAt(0) || 0) % 25;
        return Math.min(98, baseScore + orgBonus);
    }, [job.matchScore, job.matchData, job.organization]);

    // Get experience label
    const experienceLabel = useMemo(() => {
        const level = job.experienceLevel?.toLowerCase();
        if (level === 'entry' || level === 'junior') return 'Entry Level';
        if (level === 'mid' || level === 'intermediate') return 'Mid Level';
        if (level === 'senior') return 'Senior Level';
        if (level === 'expert' || level === 'lead') return 'Expert';
        return job.experienceLevel || 'Entry Level';
    }, [job.experienceLevel]);

    // Work type (remote, hybrid, on-site)
    const workType = useMemo(() => {
        const title = job.title?.toLowerCase() || '';
        const desc = job.description?.toLowerCase() || '';
        if (title.includes('remote') || desc.includes('remote')) return 'Remote';
        if (title.includes('hybrid') || desc.includes('hybrid')) return 'Hybrid';
        return 'In Person';
    }, [job.title, job.description]);

    // Job type
    const jobType = useMemo(() => {
        return job.experienceLevel === 'Entry' ? 'Internship' : 'Full Time';
    }, [job.experienceLevel]);

    // Generate salary range
    const salaryRange = useMemo(() => {
        if (job.salaryMin && job.salaryMax) {
            return `$${(job.salaryMin / 1000).toFixed(0)}K - $${(job.salaryMax / 1000).toFixed(0)}K`;
        }
        // Generate realistic salary based on experience
        const level = job.experienceLevel?.toLowerCase();
        if (level === 'entry') return '$40K - $60K /year';
        if (level === 'mid') return '$70K - $100K /year';
        if (level === 'senior') return '$120K - $160K /year';
        return '$50K - $80K /year';
    }, [job.salaryMin, job.salaryMax, job.experienceLevel]);

    // Swipe handlers
    const forceSwipeRight = useCallback(() => {
        if (swiping.current) return;
        swiping.current = true;
        Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.2, y: 0 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
        }).start(() => {
            onSwipeRight && onSwipeRight(job);
            swiping.current = false;
        });
    }, [onSwipeRight, job, position]);

    const forceSwipeLeft = useCallback(() => {
        if (swiping.current) return;
        swiping.current = true;
        Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.2, y: 0 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
        }).start(() => {
            onSwipeLeft && onSwipeLeft(job);
            swiping.current = false;
        });
    }, [onSwipeLeft, job, position]);

    // Pan responder
    const panResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => isFirst && !swiping.current,
            onMoveShouldSetPanResponder: (_, gesture) =>
                isFirst && !swiping.current && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5),
            onPanResponderGrant: () => {
                position.setOffset({ x: position.x._value, y: position.y._value });
                position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gesture) => {
                position.flattenOffset();
                if (gesture.dx > SWIPE_THRESHOLD && gesture.vx > 0) {
                    forceSwipeRight();
                } else if (gesture.dx < -SWIPE_THRESHOLD && gesture.vx < 0) {
                    forceSwipeLeft();
                } else {
                    Animated.spring(position, {
                        toValue: { x: 0, y: 0 },
                        friction: 6,
                        tension: 100,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }), [isFirst, forceSwipeLeft, forceSwipeRight, position]
    );

    // Animations
    const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-8deg', '0deg', '8deg'],
        extrapolate: 'clamp',
    });

    const likeOpacity = position.x.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const nopeOpacity = position.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const cardStyle = {
        transform: [
            { translateX: position.x },
            { translateY: Animated.multiply(position.y, 0.3) },
            { rotate: rotate },
        ],
    };

    // Background card
    if (!isFirst) {
        return (
            <View style={[styles.card, styles.backgroundCard, { backgroundColor: '#F8F9FA' }]}>
                <View style={styles.cardContent}>
                    <Text style={styles.bgTitle} numberOfLines={2}>{job.title}</Text>
                    <Text style={styles.bgCompany}>{job.organization}</Text>
                </View>
            </View>
        );
    }

    return (
        <Animated.View
            style={[styles.card, cardStyle, { backgroundColor: '#FFFFFF' }]}
            {...panResponder.panHandlers}
        >
            {/* APPLY Stamp */}
            <Animated.View style={[styles.stamp, styles.applyStamp, { opacity: likeOpacity }]}>
                <Text style={styles.applyStampText}>APPLY</Text>
            </Animated.View>

            {/* NOPE Stamp */}
            <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
                <Text style={styles.nopeStampText}>NOPE</Text>
            </Animated.View>

            <TouchableOpacity
                style={styles.cardTouchable}
                activeOpacity={0.98}
                onPress={() => onPress && onPress(job)}
            >
                <ScrollView
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {/* Job Title */}
                    <Text style={styles.jobTitle} numberOfLines={2}>
                        {job.title}
                    </Text>

                    {/* Company Name */}
                    <Text style={styles.companyName} numberOfLines={1}>
                        {job.organization}
                    </Text>

                    {/* Location */}
                    <View style={styles.locationRow}>
                        <Feather name="map-pin" size={14} color="#666" />
                        <Text style={styles.locationText}>{job.location}</Text>
                    </View>

                    {/* Work Type & Job Type Row */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: BADGE_COLORS.workType.bg }]}>
                            <Text style={[styles.badgeText, { color: BADGE_COLORS.workType.text }]}>
                                {workType}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: BADGE_COLORS.jobType.bg }]}>
                            <Text style={[styles.badgeText, { color: BADGE_COLORS.jobType.text }]}>
                                {jobType}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: BADGE_COLORS.startup.bg }]}>
                            <Text style={[styles.badgeText, { color: BADGE_COLORS.startup.text }]}>
                                Startup
                            </Text>
                        </View>
                    </View>

                    {/* Salary */}
                    <View style={[styles.salaryBadge, { backgroundColor: BADGE_COLORS.salary.bg }]}>
                        <Feather name="dollar-sign" size={14} color={BADGE_COLORS.salary.text} />
                        <Text style={[styles.salaryText, { color: BADGE_COLORS.salary.text }]}>
                            {salaryRange}
                        </Text>
                    </View>

                    {/* Category & Education Row */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: BADGE_COLORS.category.bg }]}>
                            <Text style={[styles.badgeText, { color: BADGE_COLORS.category.text }]}>
                                {job.category || 'Technology'}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: BADGE_COLORS.education.bg }]}>
                            <Text style={[styles.badgeText, { color: BADGE_COLORS.education.text }]}>
                                Bachelor's
                            </Text>
                        </View>
                    </View>

                    {/* Experience Level */}
                    <View style={[styles.badge, { backgroundColor: BADGE_COLORS.experience.bg, alignSelf: 'flex-start' }]}>
                        <Text style={[styles.badgeText, { color: BADGE_COLORS.experience.text }]}>
                            {experienceLabel}
                        </Text>
                    </View>

                    {/* Match Score */}
                    <View style={styles.matchContainer}>
                        <View style={styles.matchBadge}>
                            <Feather name="target" size={16} color="#10B981" />
                            <Text style={styles.matchText}>{matchScore}% Match</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Floating Action Buttons */}
                <View style={styles.floatingButtons}>
                    <TouchableOpacity
                        style={[styles.floatingBtn, styles.rejectBtn]}
                        onPress={forceSwipeLeft}
                    >
                        <Feather name="x" size={24} color="#EF4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.floatingBtn, styles.saveBtn]}
                        onPress={() => onSave && onSave(job)}
                    >
                        <Feather name="bookmark" size={22} color="#FFB800" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.floatingBtn, styles.applyBtn]}
                        onPress={forceSwipeRight}
                    >
                        <Feather name="heart" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        width: SCREEN_WIDTH - 32,
        height: CARD_HEIGHT,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    backgroundCard: {
        transform: [{ scale: 0.95 }],
        top: 10,
    },
    cardContent: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    bgTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginBottom: 8,
    },
    bgCompany: {
        fontSize: 14,
        color: '#D1D5DB',
    },
    cardTouchable: {
        flex: 1,
    },
    scrollContent: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 80,
    },
    stamp: {
        position: 'absolute',
        top: 30,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 4,
        borderRadius: 8,
        transform: [{ rotate: '-15deg' }],
        zIndex: 10,
    },
    applyStamp: {
        left: 20,
        borderColor: '#10B981',
    },
    applyStampText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10B981',
    },
    nopeStamp: {
        right: 20,
        borderColor: '#EF4444',
    },
    nopeStampText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    jobTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 6,
        lineHeight: 32,
    },
    companyName: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    salaryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 10,
        gap: 4,
    },
    salaryText: {
        fontSize: 14,
        fontWeight: '700',
    },
    matchContainer: {
        marginTop: 16,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    matchText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#10B981',
    },
    floatingButtons: {
        position: 'absolute',
        right: 12,
        bottom: 20,
        gap: 10,
    },
    floatingBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    rejectBtn: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#FEE2E2',
    },
    saveBtn: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#FEF3C7',
    },
    applyBtn: {
        backgroundColor: '#10B981',
    },
});

export default memo(SwipeCard);
