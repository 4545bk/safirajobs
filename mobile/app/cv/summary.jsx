/**
 * CV Builder - Step 2: Professional Summary
 * Collects a brief professional summary with premium animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useCV } from '../../context/CVContext';
import StepIndicator from '../../components/cv/StepIndicator';
import StepNavigation from '../../components/cv/StepNavigation';
import CVPreviewModal from '../../components/cv/CVPreviewModal';
import PreviewButton from '../../components/cv/PreviewButton';

const MAX_CHARS = 500;

export default function SummaryScreen() {
    const router = useRouter();
    const { cvData, updateSection, setStep } = useCV();

    const [summary, setSummary] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Animation refs
    const headerAnim = useRef(new Animated.Value(0)).current;
    const textAreaAnim = useRef(new Animated.Value(0)).current;
    const tipsAnim = useRef(new Animated.Value(0)).current;
    const focusScale = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Initial animations
    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.spring(textAreaAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
            Animated.spring(tipsAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    // Load existing data
    useEffect(() => {
        if (cvData?.professionalSummary?.text) {
            setSummary(cvData.professionalSummary.text);
        }
        setStep(2);
    }, []);

    // Animate progress bar
    useEffect(() => {
        const progress = Math.min(summary.length / 150, 1); // Progress based on 150 chars target
        Animated.spring(progressAnim, { toValue: progress, tension: 80, friction: 12, useNativeDriver: false }).start();
    }, [summary]);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(focusScale, { toValue: 1.02, tension: 100, friction: 10, useNativeDriver: true }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(focusScale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }).start();
    };

    const handleContinue = () => {
        updateSection('professionalSummary', { text: summary.trim() });
        router.push('/cv/education');
    };

    const handleBack = () => {
        updateSection('professionalSummary', { text: summary.trim() });
        router.back();
    };

    const charCount = summary.length;
    const isValid = charCount >= 50;
    const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    const progressColor = charCount < 50 ? '#F59E0B' : charCount < 100 ? '#3B82F6' : '#10B981';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Animated Header */}
                <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                    <StepIndicator currentStep={2} totalSteps={6} />
                </Animated.View>

                {/* Title */}
                <Animated.View style={[styles.titleContainer, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleText}>
                            <Text style={styles.title}>Professional Summary</Text>
                            <Text style={styles.subtitle}>Briefly describe your experience</Text>
                        </View>
                        <PreviewButton onPress={() => setShowPreview(true)} />
                    </View>
                </Animated.View>

                {/* Form */}
                <View style={styles.content}>
                    {/* Animated TextArea */}
                    <Animated.View style={[
                        styles.inputWrapper,
                        isFocused && styles.inputWrapperFocused,
                        {
                            opacity: textAreaAnim,
                            transform: [
                                { translateY: textAreaAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                                { scale: focusScale }
                            ]
                        }
                    ]}>
                        <TextInput
                            style={styles.textArea}
                            value={summary}
                            onChangeText={setSummary}
                            placeholder="Results-driven professional with 5+ years of experience in project management and humanitarian response. Proven track record in managing multi-stakeholder programs..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={8}
                            maxLength={MAX_CHARS}
                            textAlignVertical="top"
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: progressColor }]} />
                            </View>
                            <Text style={[styles.charCount, charCount < 50 && styles.charCountLow]}>
                                {charCount}/{MAX_CHARS}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Animated Tips */}
                    <Animated.View style={[
                        styles.tips,
                        {
                            opacity: tipsAnim,
                            transform: [{ translateY: tipsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
                        }
                    ]}>
                        <Text style={styles.tipsTitle}>💡 Tips for a great summary:</Text>
                        {[
                            '• Start with years of experience',
                            '• Mention key skills and achievements',
                            '• Keep it between 50-150 words',
                            '• Use action words (led, managed, developed)'
                        ].map((tip, idx) => (
                            <Animated.Text
                                key={idx}
                                style={[styles.tipItem, { opacity: tipsAnim }]}
                            >
                                {tip}
                            </Animated.Text>
                        ))}
                    </Animated.View>
                </View>

                <StepNavigation onBack={handleBack} onContinue={handleContinue} canContinue={isValid} />
            </KeyboardAvoidingView>

            <CVPreviewModal
                visible={showPreview}
                onClose={() => setShowPreview(false)}
                cvData={{ ...cvData, professionalSummary: { text: summary } }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    titleContainer: { paddingHorizontal: spacing.xxl, marginBottom: spacing.lg },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    titleText: { flex: 1, marginRight: spacing.md },
    title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: colors.textSecondary },
    content: { flex: 1, paddingHorizontal: spacing.xxl },
    inputWrapper: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWrapperFocused: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    textArea: { fontSize: 15, color: colors.textPrimary, padding: spacing.lg, minHeight: 180, lineHeight: 24 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: 12 },
    progressTrack: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 2 },
    charCount: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
    charCountLow: { color: '#F59E0B' },
    tips: {
        backgroundColor: '#FFFBEB',
        borderRadius: 14,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    tipsTitle: { fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 10 },
    tipItem: { fontSize: 14, color: '#B45309', marginBottom: 6, lineHeight: 20 },
});
