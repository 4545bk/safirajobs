import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Switch, Dimensions, Modal, StatusBar, SafeAreaView, RefreshControl, Alert
} from 'react-native';
import { Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';
import ThemeSelector from '../components/ThemeSelector';

const { width } = Dimensions.get('window');

// Reusable Menu Section Component
const MenuSection = ({ title, items, delay = 0 }) => {
    const { colors } = useTheme();
    return (
        <AnimatedEntry delay={delay} style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, shadowColor: colors.shadowColor || '#000' }]}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.menuItem,
                            index !== items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }
                        ]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                                {item.icon}
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                        </View>

                        <View style={styles.menuItemRight}>
                            {item.value && (
                                <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{item.value}</Text>
                            )}
                            <Feather name="chevron-right" size={20} color={colors.textMuted} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </AnimatedEntry>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const { colors, isDark, setTheme } = useTheme();
    const { t, language } = useLanguage();
    const [themeModalVisible, setThemeModalVisible] = useState(false);

    // User State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUser = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Import dynamically to avoid cycle if needed, or just use imported service
            const userData = await import('../services/auth').then(m => m.getUser());
            setUser(userData);
        } catch (e) {
            console.error('Error loading user', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadUser(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    // Menu Data Definitions
    const accountItems = [
        {
            icon: <Feather name="user" size={20} color={colors.textPrimary} />,
            label: t('manageProfile'),
            onPress: () => router.push('/manage-profile')
        },
        {
            icon: <Feather name="lock" size={20} color={colors.textPrimary} />,
            label: t('passwordSecurity'),
            onPress: () => router.push('/change-password')
        },
        {
            icon: <Feather name="bell" size={20} color={colors.textPrimary} />,
            label: t('notifications'),
            onPress: () => router.push('/alerts')
        },
        {
            icon: <Feather name="globe" size={20} color={colors.textPrimary} />,
            label: t('language'),
            value: language === 'am' ? "Amharic" : "English",
            onPress: () => router.push('/language')
        },
    ];

    const menuItems = [
        {
            icon: <Feather name="globe" size={20} color={colors.textPrimary} />,
            label: t('language'),
            value: language === 'am' ? "Amharic" : "English",
            onPress: () => router.push('/language')
        },
    ];

    const preferencesItems = [
        {
            icon: <Feather name="info" size={20} color={colors.textPrimary} />,
            label: t('aboutUs'),
        },
        {
            icon: <Feather name="layout" size={20} color={colors.textPrimary} />,
            label: t('theme') || 'Theme',
            value: isDark ? t('darkMode') : t('lightMode'),
            onPress: () => setThemeModalVisible(true)
        },
        {
            icon: <Feather name="calendar" size={20} color={colors.textPrimary} />,
            label: t('interviewCalendar'),
            onPress: () => router.push('/interviews')
        },
    ];

    const supportItems = [
        {
            icon: <Feather name="shield" size={20} color={colors.textPrimary} />,
            label: t('privacyPolicy'),
            onPress: () => router.push('/privacy-policy')
        },
        {
            icon: <Feather name="file-text" size={20} color={colors.textPrimary} />,
            label: t('termsOfService'),
            onPress: () => router.push('/terms-of-service')
        },
        {
            icon: <Feather name="help-circle" size={20} color={colors.textPrimary} />,
            label: t('helpCenter'),
        },
        {
            icon: <Feather name="log-out" size={20} color={colors.textPrimary} />,
            label: t('logOut'),
            onPress: async () => {
                await import('../services/auth').then(m => m.logout());
                router.replace('/auth/login');
            }
        },
        {
            icon: <Feather name="trash-2" size={20} color="#EF4444" />,
            label: t('deleteAccount'),
            onPress: () => {
                Alert.alert(
                    t('deleteAccountTitle'),
                    t('deleteAccountMessage'),
                    [
                        { text: t('deleteAccountCancel'), style: 'cancel' },
                        {
                            text: t('deleteAccountConfirm'),
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await import('../services/auth').then(m => m.deleteAccount());
                                    Alert.alert('', t('deleteAccountSuccess'));
                                    router.replace('/auth/login');
                                } catch (error) {
                                    Alert.alert('', t('deleteAccountError'));
                                }
                            }
                        }
                    ]
                );
            }
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >

                {/* Profile Card */}
                <AnimatedEntry delay={100}>
                    <View style={[styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.shadowColor || '#000' }]}>
                        <View style={styles.profileHeaderContent}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: user?.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.name || 'User')}&background=3B82F6&color=fff&size=200` }}
                                    style={styles.avatar}
                                />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                                    {loading ? 'Loading...' : (user?.profile?.name || user?.name || 'Guest User')}
                                </Text>
                                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                                    {loading ? '...' : (user?.email || 'No email')}
                                </Text>
                                <TouchableOpacity style={styles.editButton} onPress={() => router.push('/manage-profile')}>
                                    <Text style={[styles.editButtonText, { color: '#3B82F6' }]}>{t('manageProfile')}</Text>
                                    <Feather name="chevron-right" size={14} color="#3B82F6" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </AnimatedEntry>

                {/* Build CV Banner */}
                <AnimatedEntry delay={200}>
                    <TouchableOpacity
                        style={styles.cvBanner}
                        onPress={() => router.push('/cv')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']} // Blue gradient as requested
                            style={styles.cvGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.cvContent}>
                                <View style={styles.cvIconBox}>
                                    <Feather name="file-text" size={24} color="white" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.cvTitle}>{t('buildYourCV')}</Text>
                                        <Feather name="zap" size={14} color="rgba(255,255,255,0.8)" />
                                    </View>
                                    <Text style={styles.cvSubtitle}>{t('createProfessionalCV')}</Text>
                                </View>
                                <View style={styles.cvArrow}>
                                    <Feather name="chevron-right" size={20} color="#2563EB" />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </AnimatedEntry>

                {/* Grouped Menu Sections */}
                <MenuSection title={t('account') || "Account"} items={accountItems} delay={300} />
                <MenuSection title={t('preferences') || "Preferences"} items={preferencesItems} delay={400} />
                <MenuSection title={t('support') || "Support"} items={supportItems} delay={500} />

                {/* Version */}
                <AnimatedEntry delay={600} style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Version 1.0.0</Text>
                </AnimatedEntry>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Theme Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={themeModalVisible}
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setThemeModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('selectTheme') || 'Select Theme'}</Text>
                            <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ThemeSelector />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Bottom Nav */}
            <View style={[styles.bottomNav, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
                    <Feather name="home" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navHome')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/explore')}>
                    <Feather name="compass" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navExplore')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/bookmarks')}>
                    <Feather name="heart" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navFavorites')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/applications')}>
                    <Feather name="briefcase" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navTrack')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="user" size={22} color={colors.primary} />
                    <Text style={[styles.navLabel, styles.navLabelActive, { color: colors.primary }]}>{t('navProfile')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    profileHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {

    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: 'rgba(59, 130, 246, 0.2)', // Light blue ring
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        marginBottom: 6,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // CV Banner
    cvBanner: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    cvGradient: {
        padding: 20,
    },
    cvContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    cvIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cvTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cvSubtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        marginTop: 2,
    },
    cvArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Sections
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        paddingLeft: 4,
    },
    sectionCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Bottom Nav & Modal (kept similar)
    bottomNav: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', paddingTop: 10, paddingBottom: 24,
        borderTopWidth: 1,
        elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20,
    },
    navItem: { flex: 1, alignItems: 'center', gap: 4 },
    navLabel: { fontSize: 11 },
    navLabelActive: { fontWeight: '500' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        maxHeight: '40%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
