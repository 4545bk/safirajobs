/**
 * CV Builder - Step 6: Languages
 * Final step with premium animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView, Platform,
    Animated, Easing, LayoutAnimation, UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useCV } from '../../context/CVContext';
import StepIndicator from '../../components/cv/StepIndicator';
import StepNavigation from '../../components/cv/StepNavigation';
import CVPreviewModal from '../../components/cv/CVPreviewModal';
import PreviewButton from '../../components/cv/PreviewButton';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LEVELS = ['native', 'fluent', 'advanced', 'intermediate', 'basic'];
const COMMON = ['Amharic', 'English', 'Oromiffa', 'Tigrinya', 'Somali', 'Arabic'];

// Animated Language Card
const LanguageCard = ({ lang, index, onRemove, onUpdateProficiency }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, delay: index * 100, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleRemove = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
        ]).start(() => onRemove());
    };

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <View style={styles.cardHeader}>
                <View style={styles.langIcon}>
                    <Feather name="globe" size={16} color={colors.primary} />
                </View>
                <Text style={styles.langName}>{lang.name}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.7}>
                    <Feather name="trash-2" size={14} color="#EF4444" />
                </TouchableOpacity>
            </View>
            <View style={styles.levels}>
                {LEVELS.map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.levelBtn, lang.proficiency === level && styles.levelActive]}
                        onPress={() => onUpdateProficiency(level)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.levelText, lang.proficiency === level && styles.levelTextActive]}>{level}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    );
};

// Animated Suggestion Tag
const SuggestionTag = ({ name, onAdd }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => onAdd());
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.suggestionTag} onPress={handlePress} activeOpacity={0.7}>
                <Feather name="plus" size={12} color={colors.primary} />
                <Text style={styles.suggestionText}>{name}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function LanguagesScreen() {
    const router = useRouter();
    const { cvData, updateSection, setStep } = useCV();
    const [languages, setLanguages] = useState([]);
    const [newLang, setNewLang] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Animation refs
    const headerAnim = useRef(new Animated.Value(0)).current;
    const addSectionAnim = useRef(new Animated.Value(0)).current;
    const addBtnAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.spring(addSectionAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (cvData?.languages?.length > 0) setLanguages(cvData.languages);
        setStep(6);
    }, []);

    const addLanguage = (name) => {
        const n = name || newLang.trim();
        if (n && !languages.some(l => l.name === n)) {
            Animated.sequence([
                Animated.spring(addBtnAnim, { toValue: 0.8, tension: 100, friction: 5, useNativeDriver: true }),
                Animated.spring(addBtnAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
            ]).start();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            setLanguages([...languages, { name: n, proficiency: 'intermediate' }]);
            setNewLang('');
        }
    };

    const removeLanguage = (i) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setLanguages(languages.filter((_, idx) => idx !== i));
    };

    const updateProficiency = (i, level) => {
        const u = [...languages];
        u[i].proficiency = level;
        setLanguages(u);
    };

    const handleContinue = () => {
        updateSection('languages', languages);
        router.push('/cv/templates');
    };

    const handleBack = () => {
        updateSection('languages', languages);
        router.back();
    };

    const suggestions = COMMON.filter(l => !languages.some(x => x.name === l));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Animated Header */}
                <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                    <StepIndicator currentStep={6} totalSteps={6} />
                </Animated.View>

                <Animated.View style={[styles.titleContainer, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Languages</Text>
                            <Text style={styles.subtitle}>Add languages you speak</Text>
                        </View>
                        <PreviewButton onPress={() => setShowPreview(true)} />
                    </View>

                    {/* Count indicator */}
                    {languages.length > 0 && (
                        <View style={styles.countContainer}>
                            <Feather name="check-circle" size={16} color="#10B981" />
                            <Text style={styles.countText}>{languages.length} language{languages.length !== 1 ? 's' : ''} added</Text>
                        </View>
                    )}
                </Animated.View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {/* Language Cards */}
                    {languages.map((lang, i) => (
                        <LanguageCard
                            key={i}
                            lang={lang}
                            index={i}
                            onRemove={() => removeLanguage(i)}
                            onUpdateProficiency={(level) => updateProficiency(i, level)}
                        />
                    ))}

                    {/* Add Section */}
                    <Animated.View style={[styles.addSection, {
                        opacity: addSectionAnim,
                        transform: [{ translateY: addSectionAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
                    }]}>
                        <Text style={styles.addTitle}>Add a Language</Text>

                        <View style={styles.addRow}>
                            <TextInput
                                style={styles.addInput}
                                value={newLang}
                                onChangeText={setNewLang}
                                placeholder="Type language name..."
                                placeholderTextColor={colors.textMuted}
                                onSubmitEditing={() => addLanguage()}
                            />
                            <Animated.View style={{ transform: [{ scale: addBtnAnim }] }}>
                                <TouchableOpacity style={styles.addBtn} onPress={() => addLanguage()} activeOpacity={0.7}>
                                    <Feather name="plus" size={20} color="white" />
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        {suggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                <Text style={styles.suggestionsLabel}>Quick add:</Text>
                                <View style={styles.suggestions}>
                                    {suggestions.map((s, i) => (
                                        <SuggestionTag key={i} name={s} onAdd={() => addLanguage(s)} />
                                    ))}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>

                <StepNavigation onBack={handleBack} onContinue={handleContinue} continueLabel="Choose Template" canContinue={languages.length >= 1} />
            </KeyboardAvoidingView>
            <CVPreviewModal visible={showPreview} onClose={() => setShowPreview(false)} cvData={{ ...cvData, languages }} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    titleContainer: { paddingHorizontal: spacing.xxl, marginBottom: spacing.lg },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: colors.textSecondary },
    countContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
    countText: { fontSize: 13, color: '#10B981', fontWeight: '500' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.xxl, paddingBottom: 40 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    langIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    langName: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, flex: 1 },
    removeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
    levels: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    levelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB'
    },
    levelActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    levelText: { fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize', fontWeight: '500' },
    levelTextActive: { color: 'white', fontWeight: '600' },
    addSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    addTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
    addRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    addInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 15,
        color: colors.textPrimary
    },
    addBtn: {
        width: 50,
        height: 50,
        backgroundColor: colors.primary,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    suggestionsContainer: { marginTop: 4 },
    suggestionsLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    suggestionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        gap: 4
    },
    suggestionText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
});
