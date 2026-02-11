/**
 * CV Builder - Step 1: Personal Information
 * Collects basic user info with premium animations
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

// Ethiopian regions for location dropdown
const ETHIOPIAN_REGIONS = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambella', 'Harari', 'Oromia', 'Sidama', 'Somali', 'SNNPR',
    'South West Ethiopia', 'Tigray',
];

/**
 * Animated Form Input Component
 */
const FormInput = ({
    label, value, onChangeText, placeholder, keyboardType = 'default',
    autoCapitalize = 'words', error, required = false, icon, index = 0,
}) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(scaleAnim, { toValue: 1.02, tension: 100, friction: 10, useNativeDriver: true }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={[styles.inputGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <Animated.View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                error && styles.inputError,
                { transform: [{ scale: scaleAnim }] }
            ]}>
                {icon && (
                    <Feather name={icon} size={18} color={isFocused ? colors.primary : colors.textMuted} style={styles.inputIcon} />
                )}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </Animated.View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </Animated.View>
    );
};

/**
 * Animated Region Selector Component
 */
const RegionSelector = ({ value, onSelect, error, index = 0 }) => {
    const [showPicker, setShowPicker] = useState(false);
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        ]).start();
    }, []);

    const togglePicker = () => {
        if (showPicker) {
            Animated.timing(dropdownAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowPicker(false));
        } else {
            setShowPicker(true);
            Animated.spring(dropdownAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }).start();
        }
    };

    const handleSelect = (region) => {
        onSelect(region);
        Animated.timing(dropdownAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowPicker(false));
    };

    return (
        <Animated.View style={[styles.inputGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], zIndex: 100 }]}>
            <Text style={styles.inputLabel}>
                City/Region <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
                style={[styles.inputContainer, error && styles.inputError]}
                onPress={togglePicker}
                activeOpacity={0.8}
            >
                <Feather name="map-pin" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <Text style={[styles.input, !value && styles.placeholder]}>
                    {value || 'Select your city/region'}
                </Text>
                <Animated.View style={{ transform: [{ rotate: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
                    <Feather name="chevron-down" size={18} color={colors.textMuted} />
                </Animated.View>
            </TouchableOpacity>

            {showPicker && (
                <Animated.View style={[styles.dropdown, {
                    opacity: dropdownAnim,
                    transform: [{ scale: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
                }]}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        {ETHIOPIAN_REGIONS.map((region, idx) => (
                            <TouchableOpacity
                                key={region}
                                style={[styles.dropdownItem, value === region && styles.dropdownItemActive]}
                                onPress={() => handleSelect(region)}
                            >
                                <Text style={[styles.dropdownItemText, value === region && styles.dropdownItemTextActive]}>
                                    {region}
                                </Text>
                                {value === region && <Feather name="check" size={18} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </Animated.View>
    );
};

export default function PersonalInfoScreen() {
    const router = useRouter();
    const { cvData, updateSection, setStep } = useCV();

    // Animation refs
    const headerAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(0)).current;

    // Form state
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', city: '', linkedIn: '',
    });
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    // Initial animations
    useEffect(() => {
        Animated.sequence([
            Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(contentAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    }, []);

    // Load existing data on mount
    useEffect(() => {
        if (cvData?.personalInfo) {
            setForm({
                firstName: cvData.personalInfo.firstName || '',
                lastName: cvData.personalInfo.lastName || '',
                email: cvData.personalInfo.email || '',
                phone: cvData.personalInfo.phone || '',
                city: cvData.personalInfo.city || '',
                linkedIn: cvData.personalInfo.linkedIn || '',
            });
        }
        setStep(1);
    }, []);

    // Update form field
    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!form.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^(\+251|0)?[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid Ethiopian phone number';
        }
        if (!form.city) newErrors.city = 'Please select your city/region';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle continue button
    const handleContinue = () => {
        if (validate()) {
            updateSection('personalInfo', { ...cvData.personalInfo, ...form, country: 'Ethiopia' });
            router.push('/cv/summary');
        }
    };

    // Handle back button
    const handleBack = () => {
        updateSection('personalInfo', { ...cvData.personalInfo, ...form });
        router.back();
    };

    const isFormValid = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim() && form.city;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Animated Step Indicator */}
                <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                    <StepIndicator currentStep={1} totalSteps={6} />
                </Animated.View>

                {/* Animated Title */}
                <Animated.View style={[styles.titleContainer, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Personal Information</Text>
                            <Text style={styles.subtitle}>Let's start with the basics</Text>
                        </View>
                        <PreviewButton onPress={() => setShowPreview(true)} />
                    </View>
                </Animated.View>

                {/* Form Content */}
                <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <FormInput label="First Name" value={form.firstName} onChangeText={(v) => updateField('firstName', v)} placeholder="Enter your first name" icon="user" required error={errors.firstName} index={0} />
                    <FormInput label="Last Name" value={form.lastName} onChangeText={(v) => updateField('lastName', v)} placeholder="Enter your last name" icon="user" required error={errors.lastName} index={1} />
                    <FormInput label="Email" value={form.email} onChangeText={(v) => updateField('email', v)} placeholder="your.email@example.com" keyboardType="email-address" autoCapitalize="none" icon="mail" required error={errors.email} index={2} />
                    <FormInput label="Phone Number" value={form.phone} onChangeText={(v) => updateField('phone', v)} placeholder="+251 912 345 678" keyboardType="phone-pad" icon="phone" required error={errors.phone} index={3} />
                    <RegionSelector value={form.city} onSelect={(v) => updateField('city', v)} error={errors.city} index={4} />
                    <FormInput label="LinkedIn (optional)" value={form.linkedIn} onChangeText={(v) => updateField('linkedIn', v)} placeholder="linkedin.com/in/yourprofile" keyboardType="url" autoCapitalize="none" icon="linkedin" index={5} />
                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Navigation Buttons */}
                <StepNavigation onBack={handleBack} onContinue={handleContinue} canContinue={isFormValid} />
            </KeyboardAvoidingView>

            {/* CV Preview Modal */}
            <CVPreviewModal visible={showPreview} onClose={() => setShowPreview(false)} cvData={{ ...cvData, personalInfo: { ...cvData.personalInfo, ...form } }} />
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
    formScroll: { flex: 1 },
    formContent: { paddingHorizontal: spacing.xxl },
    inputGroup: { marginBottom: spacing.lg },
    inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
    required: { color: '#EF4444' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: spacing.lg,
        minHeight: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    inputFocused: { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.15, shadowRadius: 8 },
    inputError: { borderColor: '#EF4444' },
    inputIcon: { marginRight: spacing.md },
    input: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: spacing.md },
    placeholder: { color: colors.textMuted },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: 6 },
    dropdown: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    dropdownScroll: { maxHeight: 240, borderRadius: 14 },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    dropdownItemActive: { backgroundColor: '#EBF5FF' },
    dropdownItemText: { fontSize: 15, color: colors.textPrimary },
    dropdownItemTextActive: { color: colors.primary, fontWeight: '600' },
});
