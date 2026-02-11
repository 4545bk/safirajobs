/**
 * CV Builder - Welcome Screen
 * Entry point for CV creation/editing with premium animations
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useCV } from '../../context/CVContext';

// Animated Feature Item
const FeatureItem = ({ icon, text, index }) => {
    const { colors, isDark } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: 400 + index * 100, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: 400 + index * 100, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, delay: 400 + index * 100, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.featureItem, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <Animated.View style={[styles.featureIcon, {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
                transform: [{ scale: scaleAnim }]
            }]}>
                <Feather name={icon} size={16} color="#10B981" />
            </Animated.View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{text}</Text>
        </Animated.View>
    );
};

export default function CVWelcomeScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { cvData, completionPercent, isLoading, resetCV } = useCV();

    // Animation refs
    const iconAnim = useRef(new Animated.Value(0)).current;
    const titleAnim = useRef(new Animated.Value(0)).current;
    const descAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const buttonsAnim = useRef(new Animated.Value(0)).current;
    const progressBarAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Check if user has started a CV
    const hasStartedCV = cvData?.personalInfo?.firstName || completionPercent > 0;

    // Run animations on mount
    useEffect(() => {
        // Staggered entrance animations
        Animated.stagger(100, [
            Animated.spring(iconAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(descAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.spring(progressAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
            Animated.spring(buttonsAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        ]).start();

        // Animate progress bar fill
        setTimeout(() => {
            Animated.spring(progressBarAnim, { toValue: completionPercent, tension: 50, friction: 10, useNativeDriver: false }).start();
        }, 600);

        // Icon pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const handleStart = () => router.push('/cv/personal');
    const handleContinue = () => router.push('/cv/personal');
    const handleStartFresh = () => { resetCV(); router.push('/cv/personal'); };
    const handleBack = () => router.back();

    const progressWidth = progressBarAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Animated.View style={{ transform: [{ rotate: '45deg' }] }}>
                        <Feather name="loader" size={32} color={colors.primary} />
                    </Animated.View>
                    <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: isDark ? colors.surfaceHover : '#F3F4F6' }]} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Animated Icon */}
                <Animated.View style={[
                    styles.iconContainer,
                    {
                        backgroundColor: isDark ? colors.surfaceHover : '#EBF5FF',
                        transform: [
                            { scale: Animated.multiply(iconAnim, pulseAnim) },
                            { translateY: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }
                        ],
                        opacity: iconAnim,
                    }
                ]}>
                    <View style={[styles.iconInner, { backgroundColor: isDark ? colors.surface : 'white' }]}>
                        <Feather name="file-text" size={40} color={colors.primary} />
                    </View>
                </Animated.View>

                {/* Animated Title */}
                <Animated.Text style={[
                    styles.title,
                    {
                        color: colors.textPrimary,
                        opacity: titleAnim,
                        transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                    }
                ]}>
                    Build Your CV
                </Animated.Text>

                {/* Animated Description */}
                <Animated.Text style={[
                    styles.description,
                    {
                        opacity: descAnim,
                        transform: [{ translateY: descAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                    }
                ]}>
                    {hasStartedCV
                        ? `You're ${completionPercent}% done. Continue building your professional CV.`
                        : 'Create a professional CV in just 5 minutes. Perfect for NGO and humanitarian jobs.'}
                </Animated.Text>

                {/* Animated Features */}
                <View style={styles.features}>
                    <FeatureItem icon="check-circle" text="NGO-ready format" index={0} />
                    <FeatureItem icon="download" text="Download as PDF" index={1} />
                    <FeatureItem icon="save" text="Auto-saved on device" index={2} />
                </View>

                {/* Progress Card (if started) */}
                {hasStartedCV && (
                    <Animated.View style={[
                        styles.progressCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            opacity: progressAnim,
                            transform: [
                                { scale: progressAnim },
                                { translateY: progressAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }
                            ]
                        }
                    ]}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressLeft}>
                                <View style={[styles.progressIcon, { backgroundColor: isDark ? colors.surfaceHover : '#EBF5FF' }]}>
                                    <Feather name="trending-up" size={16} color={colors.primary} />
                                </View>
                                <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>Your CV Progress</Text>
                            </View>
                            <Text style={[styles.progressPercent, { color: colors.primary }]}>{completionPercent}%</Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]}>
                            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.progressHint, { color: colors.textMuted }]}>
                            {cvData?.personalInfo?.firstName
                                ? `Welcome back, ${cvData.personalInfo.firstName}!`
                                : 'Continue where you left off'}
                        </Text>
                    </Animated.View>
                )}
            </View>

            {/* Animated Buttons */}
            <Animated.View style={[
                styles.buttons,
                {
                    opacity: buttonsAnim,
                    transform: [{ translateY: buttonsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
                }
            ]}>
                {hasStartedCV ? (
                    <>
                        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.8}>
                            <Text style={styles.primaryBtnText}>Continue Building</Text>
                            <View style={styles.btnArrow}>
                                <Feather name="arrow-right" size={18} color="white" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleStartFresh} activeOpacity={0.7}>
                            <Text style={styles.secondaryBtnText}>Start Fresh</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleStart} activeOpacity={0.8}>
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                        <View style={styles.btnArrow}>
                            <Feather name="arrow-right" size={18} color="white" />
                        </View>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    loadingText: { fontSize: 15, color: colors.textMuted },
    header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.lg, alignItems: 'center' },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: '#EBF5FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    iconInner: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
    description: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl, paddingHorizontal: spacing.md },
    features: { alignSelf: 'stretch', gap: 14, marginBottom: spacing.xl },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
    featureText: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
    progressCard: {
        alignSelf: 'stretch',
        backgroundColor: 'white',
        borderRadius: 18,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center' },
    progressTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    progressPercent: { fontSize: 22, fontWeight: '700', color: colors.primary },
    progressBar: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
    progressHint: { fontSize: 13, color: colors.textMuted },
    buttons: { paddingHorizontal: spacing.xxl, paddingBottom: 40, gap: spacing.md },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 14,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryBtnText: { fontSize: 17, fontWeight: '600', color: 'white' },
    btnArrow: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    secondaryBtn: { alignItems: 'center', paddingVertical: 14 },
    secondaryBtnText: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
});
