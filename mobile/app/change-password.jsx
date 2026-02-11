/**
 * Change Password Screen
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import * as authService from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { colors: themeColors, isDark } = useTheme();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const checkAuth = async () => {
        const token = await authService.getAuthToken();
        if (!token) {
            Alert.alert(
                t('notLoggedIn') || 'Not Logged In',
                t('guestPasswordChangeError') || 'You are currently using a Google account or a guest session. Password changes are only available for email-based accounts.',
                [{ text: t('ok') || 'OK', onPress: () => router.back() }]
            );
            return false;
        }
        return true;
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t('error') || 'Error', t('allFieldsRequired') || 'All fields are required');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(t('error') || 'Error', t('passwordTooShort') || 'New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('error') || 'Error', t('passwordsDoNotMatch') || 'New passwords do not match');
            return;
        }

        // Check if token exists first
        const isAuth = await checkAuth();
        if (!isAuth) return;

        setLoading(true);
        try {
            const response = await authService.changePassword(currentPassword, newPassword);

            if (response.success) {
                Alert.alert(t('success') || 'Success', t('passwordChangedSuccess') || 'Password changed successfully', [
                    { text: t('ok') || 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert(t('error') || 'Error', response.message || t('failedToChangePassword') || 'Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            Alert.alert(t('error') || 'Error', t('networkError') || 'Something went wrong. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('changePassword') || 'Change Password'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <AnimatedEntry delay={100}>
                        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                            {t('createStrongPassword') || 'Create a new strong password for your account.'}
                        </Text>

                        <View style={styles.form}>
                            {/* Current Password */}
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textPrimary }]}>{t('currentPassword') || 'Current Password'}</Text>
                                <View style={[styles.inputContainer, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}>
                                    <TextInput
                                        style={[styles.input, { color: themeColors.textPrimary }]}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        secureTextEntry={!showCurrent}
                                        placeholder={t('enterCurrentPassword') || "Enter current password"}
                                        placeholderTextColor={themeColors.textMuted}
                                    />
                                    <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                        <Ionicons
                                            name={showCurrent ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={themeColors.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* New Password */}
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textPrimary }]}>{t('newPassword') || 'New Password'}</Text>
                                <View style={[styles.inputContainer, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}>
                                    <TextInput
                                        style={[styles.input, { color: themeColors.textPrimary }]}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNew}
                                        placeholder={t('enterNewPassword') || "Enter new password"}
                                        placeholderTextColor={themeColors.textMuted}
                                    />
                                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                        <Ionicons
                                            name={showNew ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={themeColors.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textPrimary }]}>{t('confirmNewPassword') || 'Confirm New Password'}</Text>
                                <View style={[styles.inputContainer, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}>
                                    <TextInput
                                        style={[styles.input, { color: themeColors.textPrimary }]}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirm}
                                        placeholder={t('reEnterNewPassword') || "Re-enter new password"}
                                        placeholderTextColor={themeColors.textMuted}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                        <Ionicons
                                            name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={themeColors.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.updateButton, { backgroundColor: themeColors.primary }]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                <Text style={[styles.updateButtonText, { color: themeColors.textOnPrimary }]}>
                                    {loading ? (t('updating') || 'Updating...') : (t('updatePassword') || 'Update Password')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedEntry>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16,
        borderBottomWidth: 1
    },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: '600' },
    content: { padding: 20 },
    subtitle: {
        fontSize: 14, marginBottom: 24,
        lineHeight: 20
    },
    form: { gap: 20 },
    field: { gap: 8 },
    label: { fontSize: 14, fontWeight: '500' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderRadius: borderRadius.md,
        paddingHorizontal: 12
    },
    input: {
        flex: 1, paddingVertical: 12, fontSize: 16
    },
    updateButton: {
        paddingVertical: 16,
        borderRadius: borderRadius.md, alignItems: 'center',
        marginTop: 12
    },
    updateButtonText: {
        fontSize: 16, fontWeight: '600'
    }
});
