/**
 * CV Builder - Step 3: Education
 * Collects education history with premium animations
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

// Empty education entry template
const emptyEducation = {
    degree: '',
    fieldOfStudy: '',
    institution: '',
    startDate: { month: 1, year: new Date().getFullYear() - 4 },
    endDate: { month: 1, year: new Date().getFullYear() },
    isCurrently: false,
    gpa: '',
};

// Animated Education Card
const EducationCard = ({ entry, index, onUpdate, onRemove, canRemove }) => {
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
        <Animated.View style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
        ]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardIcon}>
                        <Feather name="book-open" size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.cardTitle}>Education {index + 1}</Text>
                </View>
                {canRemove && (
                    <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.7}>
                        <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Degree <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={entry.degree}
                    onChangeText={(v) => onUpdate('degree', v)}
                    placeholder="e.g., Bachelor of Science"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Field of Study</Text>
                <TextInput
                    style={styles.input}
                    value={entry.fieldOfStudy}
                    onChangeText={(v) => onUpdate('fieldOfStudy', v)}
                    placeholder="e.g., Computer Science"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Institution <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={entry.institution}
                    onChangeText={(v) => onUpdate('institution', v)}
                    placeholder="e.g., Addis Ababa University"
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
                        placeholder="2020"
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
                <Animated.View style={[styles.checkbox, entry.isCurrently && styles.checkboxChecked]}>
                    {entry.isCurrently && <Feather name="check" size={14} color="white" />}
                </Animated.View>
                <Text style={styles.checkboxLabel}>Currently studying here</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function EducationScreen() {
    const router = useRouter();
    const { cvData, updateSection, setStep } = useCV();

    const [education, setEducation] = useState([{ ...emptyEducation }]);
    const [showPreview, setShowPreview] = useState(false);

    // Animation refs
    const headerAnim = useRef(new Animated.Value(0)).current;
    const addBtnAnim = useRef(new Animated.Value(1)).current;

    // Initial animations
    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    }, []);

    // Load existing data
    useEffect(() => {
        if (cvData?.education?.length > 0) {
            setEducation(cvData.education);
        }
        setStep(3);
    }, []);

    const updateEntry = (index, field, value) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setEducation(updated);
    };

    const addEntry = () => {
        // Button bounce animation
        Animated.sequence([
            Animated.spring(addBtnAnim, { toValue: 0.9, tension: 100, friction: 5, useNativeDriver: true }),
            Animated.spring(addBtnAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        ]).start();
        setEducation([...education, { ...emptyEducation }]);
    };

    const removeEntry = (index) => {
        if (education.length > 1) {
            setEducation(education.filter((_, i) => i !== index));
        }
    };

    const handleContinue = () => {
        const validEducation = education.filter(e => e.degree && e.institution);
        updateSection('education', validEducation);
        router.push('/cv/experience');
    };

    const handleBack = () => {
        const validEducation = education.filter(e => e.degree && e.institution);
        updateSection('education', validEducation);
        router.back();
    };

    const isValid = education.some(e => e.degree && e.institution);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Animated Header */}
                <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                    <StepIndicator currentStep={3} totalSteps={6} />
                </Animated.View>

                {/* Title */}
                <Animated.View style={[styles.titleContainer, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleText}>
                            <Text style={styles.title}>Education</Text>
                            <Text style={styles.subtitle}>Add your academic background</Text>
                        </View>
                        <PreviewButton onPress={() => setShowPreview(true)} />
                    </View>
                </Animated.View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {education.map((entry, index) => (
                        <EducationCard
                            key={index}
                            entry={entry}
                            index={index}
                            onUpdate={(field, value) => updateEntry(index, field, value)}
                            onRemove={() => removeEntry(index)}
                            canRemove={education.length > 1}
                        />
                    ))}

                    {/* Animated Add Button */}
                    <Animated.View style={{ transform: [{ scale: addBtnAnim }] }}>
                        <TouchableOpacity style={styles.addButton} onPress={addEntry} activeOpacity={0.7}>
                            <View style={styles.addBtnIcon}>
                                <Feather name="plus" size={18} color="white" />
                            </View>
                            <Text style={styles.addButtonText}>Add Another Education</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <StepNavigation onBack={handleBack} onContinue={handleContinue} canContinue={isValid} />
            </KeyboardAvoidingView>

            <CVPreviewModal visible={showPreview} onClose={() => setShowPreview(false)} cvData={{ ...cvData, education }} />
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
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, paddingVertical: 4 },
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
