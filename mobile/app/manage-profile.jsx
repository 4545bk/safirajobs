/**
 * Manage Profile Screen - Edit user profile info
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getUser, updateProfile } from '../services/auth';
import { uploadProfileImage } from '../services/upload';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';

export default function ManageProfileScreen() {
    const router = useRouter();
    const { colors: themeColors, isDark } = useTheme();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        title: '',
        email: '',
        phone: '',
        bio: '',
        avatar: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await getUser();
            if (user) {
                setForm({
                    name: user.profile?.name || user.name || '',
                    title: user.profile?.title || '',
                    email: user.email || '',
                    phone: user.profile?.phone || '',
                    bio: user.profile?.bio || '',
                    avatar: user.profile?.avatar || '',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handlePickPhoto = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || !result.assets[0]) return;

            setLoading(true);
            const pickedImage = result.assets[0];

            // Get user ID for upload
            const user = await getUser();
            if (!user) {
                Alert.alert('Error', 'User session invalid. Please login again.');
                setLoading(false);
                return;
            }

            const userId = user._id || user.id;
            if (!userId) {
                Alert.alert('Error', 'User ID missing. Please login again.');
                setLoading(false);
                return;
            }

            const uploadResult = await uploadProfileImage(userId, pickedImage.uri);

            if (uploadResult.success && uploadResult.data?.url) {
                const newAvatarUrl = uploadResult.data.url;
                setForm(prev => ({ ...prev, avatar: newAvatarUrl }));
                // We don't save profile immediately, user must click Save
            } else {
                Alert.alert('Upload Failed', uploadResult.error || 'Could not upload image.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            Alert.alert(t('error') || 'Required', t('enterName') || 'Please enter your name.');
            return;
        }

        setLoading(true);
        try {
            const result = await updateProfile({
                name: form.name,
                title: form.title,
                phone: form.phone,
                bio: form.bio,
                email: form.email,
                avatar: form.avatar
            });

            if (result.success) {
                Alert.alert(t('success') || 'Success', t('profileUpdated') || 'Profile updated successfully!', [
                    { text: t('ok') || 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert(t('error') || 'Error', result.message || 'Failed to update profile.');
            }
        } catch (error) {
            Alert.alert(t('error') || 'Error', t('profileUpdateFailed') || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('manageProfile')}</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    <Text style={[styles.saveBtn, { color: themeColors.primary }, loading && { opacity: 0.5 }]}>
                        {loading ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <AnimatedEntry delay={100}>
                        <View style={styles.avatarSection}>
                            <View style={[styles.avatar, { backgroundColor: isDark ? themeColors.surfaceHover : '#E8E8E8' }]}>
                                {form.avatar ? (
                                    <Image source={{ uri: form.avatar }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
                                ) : (
                                    <Feather name="user" size={40} color={themeColors.primary} />
                                )}
                            </View>
                            <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickPhoto}>
                                <Feather name="camera" size={16} color={themeColors.primary} />
                                <Text style={[styles.changePhotoText, { color: themeColors.primary }]}>{t('changePhoto') || 'Change Photo'}</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedEntry>

                    {/* Form Fields */}
                    <AnimatedEntry delay={200}>
                        <View style={[styles.form, { backgroundColor: themeColors.surface }]}>
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('fullName') || 'Full Name'} *</Text>
                                <TextInput
                                    style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                    placeholder={t('fullNamePlaceholder') || "Enter your full name"}
                                    value={form.name}
                                    onChangeText={(t) => setForm(f => ({ ...f, name: t }))}
                                    placeholderTextColor={themeColors.textMuted}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('jobTitle') || 'Job Title'}</Text>
                                <TextInput
                                    style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                    placeholder={t('jobTitlePlaceholder') || "e.g. Software Engineer"}
                                    value={form.title}
                                    onChangeText={(t) => setForm(f => ({ ...f, title: t }))}
                                    placeholderTextColor={themeColors.textMuted}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('email')}</Text>
                                <TextInput
                                    style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                    placeholder="your.email@example.com"
                                    value={form.email}
                                    onChangeText={(t) => setForm(f => ({ ...f, email: t }))}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={themeColors.textMuted}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('phone') || 'Phone Number'}</Text>
                                <TextInput
                                    style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                    placeholder="+251 9XX XXX XXX"
                                    value={form.phone}
                                    onChangeText={(t) => setForm(f => ({ ...f, phone: t }))}
                                    keyboardType="phone-pad"
                                    placeholderTextColor={themeColors.textMuted}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('bio') || 'Bio'}</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                    placeholder={t('bioPlaceholder') || "Tell us about yourself..."}
                                    value={form.bio}
                                    onChangeText={(t) => setForm(f => ({ ...f, bio: t }))}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor={themeColors.textMuted}
                                />
                            </View>
                        </View>
                    </AnimatedEntry>

                    {/* Quick Links */}
                    <AnimatedEntry delay={300}>
                        <View style={[styles.quickLinks, { backgroundColor: themeColors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('quickLinks') || 'Quick Links'}</Text>
                            <TouchableOpacity style={[styles.linkItem, { borderBottomColor: themeColors.borderLight }]} onPress={() => router.push('/cv')}>
                                <Feather name="file-text" size={20} color={themeColors.primary} />
                                <Text style={[styles.linkText, { color: themeColors.textPrimary }]}>{t('buildEditCV') || 'Build/Edit CV'}</Text>
                                <Feather name="chevron-right" size={18} color={themeColors.textMuted} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.linkItem, { borderBottomColor: themeColors.borderLight }]} onPress={() => router.push('/applications')}>
                                <Feather name="briefcase" size={20} color={themeColors.primary} />
                                <Text style={[styles.linkText, { color: themeColors.textPrimary }]}>{t('myApplications')}</Text>
                                <Feather name="chevron-right" size={18} color={themeColors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </AnimatedEntry>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
        borderBottomWidth: 1
    },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: '600' },
    saveBtn: { fontSize: 16, fontWeight: '600' },
    content: { flex: 1, padding: 16 },
    avatarSection: { alignItems: 'center', marginBottom: 24 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12
    },
    changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    changePhotoText: { fontSize: 14, fontWeight: '500' },
    form: { borderRadius: 16, padding: 20, marginBottom: 20 },
    field: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
    input: {
        borderWidth: 1, borderRadius: 12, padding: 14,
        fontSize: 15
    },
    textArea: { height: 100 },
    quickLinks: { borderRadius: 16, padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    linkItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
        borderBottomWidth: 1
    },
    linkText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500' },
});
