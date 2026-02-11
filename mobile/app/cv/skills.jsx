/**
 * CV Builder - Step 5: Skills
 * Collects skills with premium animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
    LayoutAnimation,
    UIManager,
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

// Common skills suggestions
const SKILL_SUGGESTIONS = {
    technical: ['Project Management', 'M&E', 'Data Analysis', 'Research', 'Report Writing', 'Proposal Writing'],
    software: ['Microsoft Office', 'Excel', 'SPSS', 'Kobo Toolbox', 'Power BI', 'Tableau'],
    soft: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Time Management'],
};

// Animated Skill Tag
const SkillTag = ({ skill, onRemove }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }, []);

    const handleRemove = () => {
        Animated.timing(scaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => onRemove());
    };

    return (
        <Animated.View style={[styles.skillTag, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.skillText}>{skill.name}</Text>
            <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={14} color={colors.primary} />
            </TouchableOpacity>
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

// Animated Skill Section
const SkillSection = ({ category, title, icon, skills, newSkill, onNewSkillChange, onAddSkill, onRemoveSkill, onAddSuggestion, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const addBtnAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 120, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        ]).start();
    }, []);

    const handleAddSkill = () => {
        Animated.sequence([
            Animated.spring(addBtnAnim, { toValue: 0.8, tension: 100, friction: 5, useNativeDriver: true }),
            Animated.spring(addBtnAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        ]).start();
        onAddSkill();
    };

    const suggestions = SKILL_SUGGESTIONS[category]
        .filter(s => !skills.some(sk => sk.name === s))
        .slice(0, 4);

    return (
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Feather name={icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{skills.length}</Text>
                </View>
            </View>

            {/* Added skills */}
            <View style={styles.skillsList}>
                {skills.map((skill, idx) => (
                    <SkillTag key={idx} skill={skill} onRemove={() => onRemoveSkill(idx)} />
                ))}
            </View>

            {/* Add input */}
            <View style={styles.addRow}>
                <TextInput
                    style={styles.addInput}
                    value={newSkill}
                    onChangeText={onNewSkillChange}
                    placeholder={`Add ${title.toLowerCase()}...`}
                    placeholderTextColor={colors.textMuted}
                    onSubmitEditing={handleAddSkill}
                    returnKeyType="done"
                />
                <Animated.View style={{ transform: [{ scale: addBtnAnim }] }}>
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddSkill} activeOpacity={0.7}>
                        <Feather name="plus" size={18} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>Suggestions:</Text>
                    <View style={styles.suggestions}>
                        {suggestions.map((name, idx) => (
                            <SuggestionTag key={idx} name={name} onAdd={() => onAddSuggestion(name)} />
                        ))}
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

export default function SkillsScreen() {
    const router = useRouter();
    const { cvData, updateSection, setStep } = useCV();

    const [skills, setSkills] = useState({ technical: [], software: [], soft: [] });
    const [newSkill, setNewSkill] = useState({ technical: '', software: '', soft: '' });
    const [showPreview, setShowPreview] = useState(false);

    const headerAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    }, []);

    useEffect(() => {
        if (cvData?.skills) {
            setSkills({
                technical: cvData.skills.technical || [],
                software: cvData.skills.software || [],
                soft: cvData.skills.soft || [],
            });
        }
        setStep(5);
    }, []);

    // Animate progress
    const totalSkills = skills.technical.length + skills.software.length + skills.soft.length;
    useEffect(() => {
        const progress = Math.min(totalSkills / 6, 1);
        Animated.spring(progressAnim, { toValue: progress, tension: 80, friction: 12, useNativeDriver: false }).start();
    }, [totalSkills]);

    const addSkill = (category) => {
        const skillName = newSkill[category].trim();
        if (skillName && !skills[category].some(s => s.name === skillName)) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            setSkills({
                ...skills,
                [category]: [...skills[category], { name: skillName, level: 'intermediate' }],
            });
            setNewSkill({ ...newSkill, [category]: '' });
        }
    };

    const addSuggestion = (category, name) => {
        if (!skills[category].some(s => s.name === name)) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            setSkills({
                ...skills,
                [category]: [...skills[category], { name, level: 'intermediate' }],
            });
        }
    };

    const removeSkill = (category, index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSkills({
            ...skills,
            [category]: skills[category].filter((_, i) => i !== index),
        });
    };

    const handleContinue = () => {
        updateSection('skills', skills);
        router.push('/cv/languages');
    };

    const handleBack = () => {
        updateSection('skills', skills);
        router.back();
    };

    const isValid = totalSkills >= 3;
    const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    const progressColor = totalSkills < 3 ? '#F59E0B' : '#10B981';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                    <StepIndicator currentStep={5} totalSteps={6} />
                </Animated.View>

                <Animated.View style={[styles.titleContainer, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleText}>
                            <Text style={styles.title}>Skills</Text>
                            <Text style={styles.subtitle}>Add at least 3 skills</Text>
                        </View>
                        <PreviewButton onPress={() => setShowPreview(true)} />
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: progressColor }]} />
                        </View>
                        <Text style={[styles.progressText, { color: progressColor }]}>{totalSkills}/6+</Text>
                    </View>
                </Animated.View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <SkillSection
                        category="technical"
                        title="Technical Skills"
                        icon="tool"
                        skills={skills.technical}
                        newSkill={newSkill.technical}
                        onNewSkillChange={(v) => setNewSkill({ ...newSkill, technical: v })}
                        onAddSkill={() => addSkill('technical')}
                        onRemoveSkill={(idx) => removeSkill('technical', idx)}
                        onAddSuggestion={(name) => addSuggestion('technical', name)}
                        index={0}
                    />
                    <SkillSection
                        category="software"
                        title="Software & Tools"
                        icon="monitor"
                        skills={skills.software}
                        newSkill={newSkill.software}
                        onNewSkillChange={(v) => setNewSkill({ ...newSkill, software: v })}
                        onAddSkill={() => addSkill('software')}
                        onRemoveSkill={(idx) => removeSkill('software', idx)}
                        onAddSuggestion={(name) => addSuggestion('software', name)}
                        index={1}
                    />
                    <SkillSection
                        category="soft"
                        title="Soft Skills"
                        icon="heart"
                        skills={skills.soft}
                        newSkill={newSkill.soft}
                        onNewSkillChange={(v) => setNewSkill({ ...newSkill, soft: v })}
                        onAddSkill={() => addSkill('soft')}
                        onRemoveSkill={(idx) => removeSkill('soft', idx)}
                        onAddSuggestion={(name) => addSuggestion('soft', name)}
                        index={2}
                    />
                    <View style={{ height: 40 }} />
                </ScrollView>

                <StepNavigation onBack={handleBack} onContinue={handleContinue} canContinue={isValid} />
            </KeyboardAvoidingView>

            <CVPreviewModal visible={showPreview} onClose={() => setShowPreview(false)} cvData={{ ...cvData, skills }} />
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
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
    progressTrack: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 13, fontWeight: '600' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.xxl },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    sectionIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 },
    countBadge: { backgroundColor: '#EBF5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    countText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12, minHeight: 10 },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF5FF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    skillText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
    addRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    addInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
    },
    addBtn: {
        width: 46,
        height: 46,
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
    suggestionsLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    suggestionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 4,
    },
    suggestionText: { fontSize: 12, color: colors.textSecondary },
});
