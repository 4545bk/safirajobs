/**
 * Employer Login Screen
 */

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { login, register } from '../../services/employerAuth';

export default function EmployerLoginScreen() {
    const router = useRouter();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
    });

    const handleSubmit = async () => {
        // Validation
        if (!form.email.trim() || !form.password.trim()) {
            Alert.alert('Required', 'Please enter email and password');
            return;
        }

        if (mode === 'register') {
            if (form.password !== form.confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            if (form.password.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters');
                return;
            }
            if (!form.companyName.trim()) {
                Alert.alert('Required', 'Please enter your company name');
                return;
            }
        }

        setLoading(true);
        try {
            let result;

            if (mode === 'login') {
                result = await login({
                    email: form.email,
                    password: form.password,
                });
            } else {
                result = await register({
                    email: form.email,
                    password: form.password,
                    role: 'employer',
                    profile: { company: form.companyName },
                });
            }

            if (result.success) {
                router.replace('/employer/dashboard');
            } else {
                Alert.alert('Error', result.message || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Feather name="briefcase" size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>
                            {mode === 'login' ? 'Employer Login' : 'Create Employer Account'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {mode === 'login'
                                ? 'Access your employer dashboard'
                                : 'Start posting jobs and finding talent'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {mode === 'register' && (
                            <View style={styles.field}>
                                <Text style={styles.label}>Company Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your Company Name"
                                    value={form.companyName}
                                    onChangeText={(v) => setForm(f => ({ ...f, companyName: v }))}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        )}

                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="employer@company.com"
                                value={form.email}
                                onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={form.password}
                                onChangeText={(v) => setForm(f => ({ ...f, password: v }))}
                                secureTextEntry
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        {mode === 'register' && (
                            <View style={styles.field}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChangeText={(v) => setForm(f => ({ ...f, confirmPassword: v }))}
                                    secureTextEntry
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.submitBtnText}>
                                    {mode === 'login' ? 'Login' : 'Create Account'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Toggle Mode */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>
                            {mode === 'login'
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                        >
                            <Text style={styles.toggleLink}>
                                {mode === 'login' ? 'Register' : 'Login'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Job Seeker Link */}
                    <TouchableOpacity
                        style={styles.jobSeekerLink}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Feather name="user" size={16} color={colors.textSecondary} />
                        <Text style={styles.jobSeekerLinkText}>I'm a Job Seeker</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    content: { flex: 1, padding: spacing.lg },

    backBtn: { marginBottom: 20 },

    header: { alignItems: 'center', marginBottom: 32 },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EBF5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

    form: { marginBottom: 24 },
    field: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: colors.textPrimary,
    },

    submitBtn: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { fontSize: 16, fontWeight: '600', color: 'white' },

    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 24,
    },
    toggleText: { fontSize: 14, color: colors.textSecondary },
    toggleLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },

    jobSeekerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    jobSeekerLinkText: { fontSize: 14, color: colors.textSecondary },
});
