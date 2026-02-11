/**
 * CV Builder - Step 4: Experience
 * Collects work experience with premium animations
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useCV } from '../../context/CVContext';
import StepIndicator from '../../components/cv/StepIndicator';
import StepNavigation from '../../components/cv/StepNavigation';
import CVPreviewModal from '../../components/cv/CVPreviewModal';
import PreviewButton from '../../components/cv/PreviewButton';

// Empty experience entry
const emptyExperience = {
    jobTitle: '',
    organization: '',
    location: { city: '' },
    startDate: { month: 1, year: new Date().getFullYear() - 2 },
    endDate: { month: 1, year: new Date().getFullYear() },
    isCurrently: false,
    responsibilities: [''],
};

// Animated Experience Card
const ExperienceCard = ({ entry, index, onUpdate, onRemove, canRemove, onUpdateResp, onAddResp, onRemoveResp }) => {
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
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardIcon}>
                        <Feather name="briefcase" size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.cardTitle}>Experience {index + 1}</Text>
                </View>
                {canRemove && (
                    <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.7}>
                        <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={entry.jobTitle}
                    onChangeText={(v) => onUpdate('jobTitle', v)}
                    placeholder="e.g., Project Manager"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Organization <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={entry.organization}
                    onChangeText={(v) => onUpdate('organization', v)}
                    placeholder="e.g., Save the Children"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    value={entry.location?.city || ''}
                    onChangeText={(v) => onUpdate('location', { city: v })}
                    placeholder="e.g., Addis Ababa"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Start Year</Text>
                    <TextInput
                        style={styles.input}
                        value={entry.startDate?.year?.toString() || ''}
                        onChangeText={(v) => onUpdate('startDate', { ...entry.startDate, year: parseInt(v) || 0 })}
                        placeholder="2022"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>End Year</Text>
                    <TextInput
                        style={styles.input}
                        value={entry.isCurrently ? 'Present' : (entry.endDate?.year?.toString() || '')}
                        onChangeText={(v) => onUpdate('endDate', { ...entry.endDate, year: parseInt(v) || 0 })}
                        placeholder="2024"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textMuted}
                        editable={!entry.isCurrently}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => onUpdate('isCurrently', !entry.isCurrently)}
                activeOpacity={0.7}
            >
                <View style={[styles.checkbox, entry.isCurrently && styles.checkboxChecked]}>
                    {entry.isCurrently && <Feather name="check" size={14} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>I currently work here</Text>
            </TouchableOpacity>

            {/* Responsibilities */}
            <View style={styles.respSection}>
                <Text style={styles.respTitle}>Key Responsibilities</Text>
                {entry.responsibilities.map((resp, respIdx) => (
                    <View key={respIdx} style={styles.respRow}>
                        <View style={styles.respBullet}>
                            <Text style={styles.bulletText}>{respIdx + 1}</Text>
                        </View>
                        <TextInput
                            style={styles.respInput}
                            value={resp}
                            onChangeText={(v) => onUpdateResp(respIdx, v)}
                            placeholder="Describe a key responsibility..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                        />
                        {entry.responsibilities.length > 1 && (
                            <TouchableOpacity style={styles.respRemove} onPress={() => onRemoveResp(respIdx)}>
                                <Feather name="x" size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                <TouchableOpacity style={styles.addRespBtn} onPress={onAddResp} activeOpacity={0.7}>
                    <Feather name="plus" size={14} color={colors.primary} />
                    <Text style={styles.addRespText}>Add responsibility</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default function ExperienceScreen() {
    const router = useRouter();
    const { cvData, updateSection, setStep } = useCV();

    const [experience, setExperience] = useState([{ ...emptyExperience }]);
    const [showPreview, setShowPreview] = useState(false);

    const headerAnim = useRef(new Animated.Value(0)).current;
    const addBtnAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    }, []);

    useEffect(() => {
        if (cvData?.experience?.length > 0) {
            setExperience(cvData.experience);
        }
        setStep(4);
    }, []);

    const updateEntry = (index, field, value) => {
        const updated = [...experience];
        updated[index] = { ...updated[index], [field]: value };
        setExperience(updated);
    };

    const updateResponsibility = (expIndex, respIndex, value) => {
        const updated = [...experience];
        const resp = [...updated[expIndex].responsibilities];
        resp[respIndex] = value;
        updated[expIndex].responsibilities = resp;
        setExperience(updated);
    };

    const addResponsibility = (expIndex) => {
        const updated = [...experience];
        updated[expIndex].responsibilities = [...updated[expIndex].responsibilities, ''];
        setExperience(updated);
    };

    const removeResponsibility = (expIndex, respIndex) => {
        const updated = [...experience];
        if (updated[expIndex].responsibilities.length > 1) {
            updated[expIndex].responsibilities = updated[expIndex].responsibilities.filter((_, i) => i !== respIndex);
            setExperience(updated);
        }
    };

    const addEntry = () => {
        Animated.sequence([
            Animated.spring(addBtnAnim, { toValue: 0.9, tension: 100, friction: 5, useNativeDriver: true }),
            Animated.spring(addBtnAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        ]).start();
        setExperience([...experience, { ...emptyExperience, responsibilities: [''] }]);
    };

    const removeEntry = (index) => {
        if (experience.length > 1) {
            setExperience(experience.filter((_, i) => i !== index));
        }
    };

    const handleContinue = () => {
        const validExp = experience.filter(e => e.jobTitle && e.organization).map(e => ({
            ...e,
            responsibilities: e.responsibilities.filter(r => r.trim()),
        }));
        updateSection('experience', validExp);
        router.push('/cv/skills');
    };

    const handleBack = () => {
        const validExp = experience.filter(e => e.jobTitle && e.organization);
        updateSection('experience', validExp);
        router.back();
    };

    const isValid = experience.length === 0 || experience.some(e => e.jobTitle && e.organization);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                    <StepIndicator currentStep={4} totalSteps={6} />
                </Animated.View>

                <Animated.View style={[styles.titleContainer, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleText}>
                            <Text style={styles.title}>Work Experience</Text>
                            <Text style={styles.subtitle}>Add your professional history</Text>
                        </View>
                        <PreviewButton onPress={() => setShowPreview(true)} />
                    </View>
                </Animated.View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {experience.map((entry, index) => (
                        <ExperienceCard
                            key={index}
                            entry={entry}
                            index={index}
                            onUpdate={(field, value) => updateEntry(index, field, value)}
                            onRemove={() => removeEntry(index)}
                            canRemove={experience.length > 1}
                            onUpdateResp={(respIdx, value) => updateResponsibility(index, respIdx, value)}
                            onAddResp={() => addResponsibility(index)}
                            onRemoveResp={(respIdx) => removeResponsibility(index, respIdx)}
                        />
                    ))}

                    <Animated.View style={{ transform: [{ scale: addBtnAnim }] }}>
                        <TouchableOpacity style={styles.addButton} onPress={addEntry} activeOpacity={0.7}>
                            <View style={styles.addBtnIcon}>
                                <Feather name="plus" size={18} color="white" />
                            </View>
                            <Text style={styles.addButtonText}>Add Another Experience</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <StepNavigation onBack={handleBack} onContinue={handleContinue} canContinue={isValid} />
            </KeyboardAvoidingView>

            <CVPreviewModal visible={showPreview} onClose={() => setShowPreview(false)} cvData={{ ...cvData, experience }} />
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
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.xxl },
    card: {
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
    inputGroup: { marginBottom: spacing.md },
    label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
    required: { color: '#EF4444' },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: spacing.lg,
        paddingVertical: 14,
        fontSize: 15,
        color: colors.textPrimary,
    },
    row: { flexDirection: 'row', gap: spacing.md },
    halfInput: { flex: 1 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg, paddingVertical: 4 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkboxLabel: { fontSize: 14, color: colors.textSecondary },
    respSection: { marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    respTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
    respRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    respBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 8 },
    bulletText: { fontSize: 11, fontWeight: '600', color: colors.primary },
    respInput: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 12,
        minHeight: 44,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    respRemove: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
    addRespBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
    addRespText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
        backgroundColor: '#F0F4FF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderStyle: 'dashed',
    },
    addBtnIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    addButtonText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
