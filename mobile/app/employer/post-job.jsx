/**
 * Post Job Screen
 * Form for employers to create new job postings
 */

import React, { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { createJob } from '../../services/employerAuth';

const CATEGORIES = ['IT', 'Finance', 'Health', 'Marketing', 'Engineering', 'Education', 'Sales', 'Admin', 'General'];
const WORK_TYPES = ['on-site', 'remote', 'hybrid'];
const CONTRACT_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior'];

export default function PostJobScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        category: 'General',
        type: 'full-time',
        workType: 'on-site',
        experienceLevel: 'Mid',
        salary: '',
        skills: '',
        benefits: '',
        deadline: '',
    });

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.title.trim()) {
            Alert.alert('Required', 'Please enter a job title');
            return;
        }
        if (!form.description.trim()) {
            Alert.alert('Required', 'Please enter a job description');
            return;
        }
        if (!form.location.trim()) {
            Alert.alert('Required', 'Please enter a location');
            return;
        }

        setLoading(true);
        try {
            const jobData = {
                ...form,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                benefits: form.benefits.split(',').map(b => b.trim()).filter(Boolean),
                deadline: form.deadline ? new Date(form.deadline) : null,
            };

            const result = await createJob(jobData);

            if (result.success) {
                Alert.alert('Success', 'Job posted successfully!', [
                    { text: 'View Jobs', onPress: () => router.push('/employer/my-jobs') },
                    { text: 'Post Another', onPress: () => setForm({ ...form, title: '', description: '' }) },
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to post job');
            }
        } catch (error) {
            console.error('Post job error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderPicker = (label, field, options) => (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerRow}>
                {options.map(option => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.pickerOption,
                            form[field] === option && styles.pickerOptionActive
                        ]}
                        onPress={() => updateField(field, option)}
                    >
                        <Text style={[
                            styles.pickerOptionText,
                            form[field] === option && styles.pickerOptionTextActive
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post a Job</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Job Title */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Job Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Senior Software Engineer"
                            value={form.title}
                            onChangeText={(v) => updateField('title', v)}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Location */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Location *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Addis Ababa, Ethiopia"
                            value={form.location}
                            onChangeText={(v) => updateField('location', v)}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Category */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.pickerRow}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.pickerOption,
                                            form.category === cat && styles.pickerOptionActive
                                        ]}
                                        onPress={() => updateField('category', cat)}
                                    >
                                        <Text style={[
                                            styles.pickerOptionText,
                                            form.category === cat && styles.pickerOptionTextActive
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Work Type */}
                    {renderPicker('Work Type', 'workType', WORK_TYPES)}

                    {/* Contract Type */}
                    {renderPicker('Contract Type', 'type', CONTRACT_TYPES)}

                    {/* Experience Level */}
                    {renderPicker('Experience Level', 'experienceLevel', EXPERIENCE_LEVELS)}

                    {/* Salary */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Salary Range</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 50,000 - 80,000 ETB/month"
                            value={form.salary}
                            onChangeText={(v) => updateField('salary', v)}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Job Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe the role, responsibilities, and what you're looking for..."
                            value={form.description}
                            onChangeText={(v) => updateField('description', v)}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Requirements */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Requirements</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="List qualifications, skills, and experience required..."
                            value={form.requirements}
                            onChangeText={(v) => updateField('requirements', v)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Skills */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Required Skills (comma-separated)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. React, Node.js, MongoDB"
                            value={form.skills}
                            onChangeText={(v) => updateField('skills', v)}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Benefits */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Benefits (comma-separated)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Health insurance, Flexible hours, Remote work"
                            value={form.benefits}
                            onChangeText={(v) => updateField('benefits', v)}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Application Deadline */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Application Deadline</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            value={form.deadline}
                            onChangeText={(v) => updateField('deadline', v)}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Feather name="send" size={20} color="white" />
                                <Text style={styles.submitBtnText}>Post Job</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },

    content: { flex: 1, padding: spacing.md },

    field: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: colors.textPrimary,
    },
    textArea: { height: 120, textAlignVertical: 'top' },

    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pickerOption: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pickerOptionActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pickerOptionText: { fontSize: 13, color: colors.textSecondary },
    pickerOptionTextActive: { color: 'white', fontWeight: '600' },

    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        gap: 10,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
