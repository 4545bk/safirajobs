/**
 * Explore Screen - Discover jobs by category and trends
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius, typography, getLogoColor } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';
const { width } = Dimensions.get('window');

const CATEGORIES = [
    { name: 'Health', icon: 'heart', color: '#EF4444' },
    { name: 'IT', icon: 'code', color: '#3B82F6' },
    { name: 'Finance', icon: 'dollar-sign', color: '#10B981' },
    { name: 'Marketing', icon: 'trending-up', color: '#F59E0B' },
    { name: 'Logistics', icon: 'truck', color: '#8B5CF6' },
    { name: 'Communications', icon: 'message-circle', color: '#EC4899' },
    { name: 'M&E', icon: 'bar-chart-2', color: '#06B6D4' },
    { name: 'Education', icon: 'book', color: '#14B8A6' },
];

const CategoryCard = ({ category, onPress, jobCount, colors: themeColors }) => {
    const activeColors = themeColors || colors;
    return (
        <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: activeColors.surface, shadowColor: activeColors.shadowColor || '#000' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Feather name={category.icon} size={24} color={category.color} />
            </View>
            <Text style={[styles.categoryName, { color: activeColors.textPrimary }]}>{category.name}</Text>
            <Text style={[styles.categoryCount, { color: activeColors.textSecondary }]}>{jobCount || 0} jobs</Text>
        </TouchableOpacity>
    );
};

const JobCard = ({ job, onPress, colors: themeColors }) => {
    const activeColors = themeColors || colors;
    const logoColors = getLogoColor(job.organization || 'Job');
    return (
        <TouchableOpacity style={[
            styles.trendingCard,
            { backgroundColor: activeColors.surface, shadowColor: activeColors.shadowColor || '#000' }
        ]} onPress={onPress}>
            <View style={[styles.trendingLogo, { backgroundColor: logoColors.bg }]}>
                <Text style={[styles.trendingLogoText, { color: logoColors.text }]}>
                    {job.organization?.charAt(0) || '?'}
                </Text>
            </View>
            <View style={styles.trendingInfo}>
                <Text style={[styles.trendingTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
                <Text style={[styles.trendingOrg, { color: activeColors.textSecondary }]} numberOfLines={1}>{job.organization}</Text>
                <View style={styles.trendingMeta}>
                    <Feather name="map-pin" size={12} color={activeColors.textMuted} />
                    <Text style={[styles.trendingLocation, { color: activeColors.textMuted }]}>{job.location?.split(',')[0]}</Text>
                </View>
            </View>
            <Feather name="chevron-right" size={20} color={activeColors.textMuted} />
        </TouchableOpacity>
    );
};

export default function ExploreScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recentJobs, setRecentJobs] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch recent jobs
            const response = await fetch(`${API_BASE_URL}/jobs?limit=10&sort=posted`);
            const data = await response.json();
            if (data.success) {
                setRecentJobs(data.data.jobs);

                // Count jobs per category
                const counts = {};
                data.data.jobs.forEach(job => {
                    const cat = job.category || 'General';
                    counts[cat] = (counts[cat] || 0) + 1;
                });
                setCategoryCounts(counts);
            }
        } catch (error) {
            console.error('Failed to load explore data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category) => {
        router.push({ pathname: '/home', params: { category: category.name } });
    };

    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('navExplore')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: colors.primary }]}>
                        <Text style={styles.statNumber}>{recentJobs.length}+</Text>
                        <Text style={styles.statLabel}>{t('recentJobs')}</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: colors.primary }]}>
                        <Text style={styles.statNumber}>{Object.keys(categoryCounts).length}</Text>
                        <Text style={styles.statLabel}>{t('categories')}</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: colors.primary }]}>
                        <Text style={styles.statNumber}>50+</Text>
                        <Text style={styles.statLabel}>{t('companies')}</Text>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('browseByCategory')}</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <CategoryCard
                                key={cat.name}
                                category={cat}
                                jobCount={categoryCounts[cat.name] || Math.floor(Math.random() * 20) + 5}
                                onPress={() => handleCategoryPress(cat)}
                                colors={colors}
                            />
                        ))}
                    </View>
                </View>

                {/* Recently Posted */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('recentJobs')}</Text>
                        <TouchableOpacity onPress={() => router.push('/home')}>
                            <Text style={[styles.seeAll, { color: colors.primary }]}>{t('viewAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    {recentJobs.slice(0, 5).map(job => (
                        <JobCard
                            key={job._id}
                            job={job}
                            onPress={() => router.push(`/job/${job._id}`)}
                            colors={colors}
                        />
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('quickActions')}</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={() => router.push('/alerts')}>
                            <Feather name="bell" size={24} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{t('jobAlerts')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={() => router.push('/applications')}>
                            <Feather name="briefcase" size={24} color="#10B981" />
                            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{t('myApplications')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={() => router.push('/cv')}>
                            <Feather name="file-text" size={24} color="#F59E0B" />
                            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{t('myCV')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={[styles.bottomNav, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
                    <Feather name="home" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navHome')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="compass" size={22} color={colors.primary} />
                    <Text style={[styles.navLabel, styles.navLabelActive, { color: colors.primary }]}>{t('navExplore')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/bookmarks')}>
                    <Feather name="heart" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navFavorites')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/applications')}>
                    <Feather name="briefcase" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navTrack')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
                    <Feather name="user" size={22} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted }]}>{t('navProfile')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
        backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
    },
    backBtn: { padding: 8 },
    title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
    statBox: {
        flex: 1, backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center'
    },
    statNumber: { fontSize: 24, fontWeight: '700', color: 'white' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    section: { padding: 16, paddingTop: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
    seeAll: { color: colors.primary, fontSize: 14, fontWeight: '500' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryCard: {
        width: (width - 42) / 2, backgroundColor: 'white', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    categoryIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    categoryName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    categoryCount: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    trendingCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12,
        padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    trendingLogo: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    trendingLogoText: { fontSize: 18, fontWeight: '600' },
    trendingInfo: { flex: 1, marginLeft: 12 },
    trendingTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    trendingOrg: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    trendingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    trendingLocation: { fontSize: 12, color: colors.textMuted },
    actionsRow: { flexDirection: 'row', gap: 10 },
    actionCard: {
        flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    actionText: { fontSize: 12, color: colors.textSecondary, marginTop: 8, fontWeight: '500' },
    bottomNav: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', backgroundColor: 'white', paddingTop: 10, paddingBottom: 24,
        borderTopWidth: 1, borderTopColor: '#E5E7EB'
    },
    navItem: { flex: 1, alignItems: 'center', gap: 4 },
    navLabel: { fontSize: 11, color: colors.textMuted },
    navLabelActive: { color: colors.primary, fontWeight: '500' },
});
