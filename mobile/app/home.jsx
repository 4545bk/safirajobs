/**
 * Home Screen - New Figma Design
 * With search bar, filter pills, and bottom navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    ScrollView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getJobs } from '../services/api';
import { getBookmarks, toggleBookmark } from '../services/bookmarks';
import { colors, spacing, borderRadius, typography } from '../theme';
import JobCard from '../components/JobCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import FilterModal from '../components/FilterModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const categoryPills = ['All', 'Info. Tech.', 'Finance', 'Marketing', 'Health', 'Construction'];

export default function HomeScreen() {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    const [filters, setFilters] = useState({
        location: 'All',
        category: 'All',
        level: 'All',
        workType: 'All',
        contractType: 'All',
        postedWithin: 'all',
    });
    const [bookmarks, setBookmarks] = useState([]);
    const [isOffline, setIsOffline] = useState(false);

    // Unified Fetch Function
    const fetchJobs = async (pageNum = 1, showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const apiFilters = {
                page: pageNum,
                limit: LIMIT,
                location: filters.location !== 'All' ? filters.location : undefined,
                category: activeCategory !== 'All' ? activeCategory : (filters.category !== 'All' ? filters.category : undefined),
                experience: filters.level !== 'All' ? filters.level : undefined,
                workType: filters.workType !== 'All' ? filters.workType : undefined,
                contractType: filters.contractType !== 'All' ? filters.contractType : undefined,
                postedWithin: filters.postedWithin !== 'all' ? filters.postedWithin : undefined,
                search: searchTerm || undefined
            };

            const result = await getJobs(apiFilters);
            const jobsData = result.data?.jobs || result.jobs || [];

            setJobs(jobsData);
            setTotalPages(result.data?.pagination?.pages || 1);
            setPage(pageNum);
            setIsOffline(result.isOffline || false);

            if (pageNum === 1) {
                // Load bookmarks only on first load
                const savedBookmarks = await getBookmarks();
                setBookmarks(savedBookmarks);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Debounced Search & Filter Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJobs(1);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, activeCategory, filters]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchJobs(1, false);
    }, []);

    const handleBookmark = async (job) => {
        const isNowBookmarked = await toggleBookmark(job._id);
        if (isNowBookmarked) {
            setBookmarks(prev => [...prev, job._id]);
        } else {
            setBookmarks(prev => prev.filter(id => id !== job._id));
        }
    };

    const handleJobPress = (job) => {
        router.push(`/job/${job._id}`);
    };

    const handleClearFilters = () => {
        setFilters({
            location: 'All',
            category: 'All',
            level: 'All',
            workType: 'All',
            contractType: 'All',
            postedWithin: 'all',
        });
        setActiveCategory('All');
        setSearchTerm('');
        // fetchJobs(1) will be triggered by useEffect
    };

    // Pagination Handler
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchJobs(newPage, true);
        }
    };

    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Feather name="wifi-off" size={14} color="#92400E" />
                    <Text style={styles.offlineText}>{t('offlineMessage') || "You're offline - Showing cached data"}</Text>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                    <Text style={styles.titleAccent}>Find Jobs</Text>
                    {'\n'}with SafiraJobs
                </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <Feather name="search" size={20} color={isDark ? '#9CA3AF' : colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder={t('searchPlaceholder')}
                        placeholderTextColor={isDark ? '#9CA3AF' : colors.textMuted}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    <TouchableOpacity
                        style={styles.filterIconBtn}
                        onPress={() => setShowFilters(true)}
                    >
                        <Feather name="sliders" size={16} color={isDark ? '#9CA3AF' : colors.textMuted} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.findBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.findBtnText, { color: 'white' }]}>{t('navExplore')}</Text>
                </TouchableOpacity>
            </View>

            {/* Category Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                style={styles.pillsScroll}
                contentContainerStyle={styles.pillsContainer}
            >
                {categoryPills.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryPill,
                            {
                                backgroundColor: isDark ? '#334155' : '#F1F5F9', // Lighter dark background
                                borderColor: isDark ? '#475569' : colors.border
                            },
                            activeCategory === cat && {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                                shadowColor: colors.primary
                            }
                        ]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[
                            styles.categoryPillText,
                            { color: isDark ? '#E2E8F0' : '#475569' }, // Much lighter text
                            activeCategory === cat && { color: 'white' }
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Jobs Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('recentJobs')}</Text>
                <TouchableOpacity>
                    <Text style={[styles.showAllLink, { color: colors.textMuted }]}>{t('viewAll')}</Text>
                </TouchableOpacity>
            </View>

            {/* Jobs List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <LoadingState />
                </View>
            ) : jobs.length === 0 ? (
                <EmptyState onClearFilters={handleClearFilters} />
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <JobCard
                            job={item}
                            onPress={() => handleJobPress(item)}
                            onBookmark={handleBookmark}
                            isBookmarked={bookmarks.includes(item._id)}
                            colors={colors} // Pass colors to child
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        totalPages > 1 && (
                            <View style={styles.paginationContainer}>
                                <TouchableOpacity
                                    onPress={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                                >
                                    <Feather name="chevron-left" size={20} color={page === 1 ? colors.textMuted : colors.primary} />
                                </TouchableOpacity>

                                {/* Page Numbers (simplified logic: show current, +/- 1) */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                    .map((p, index, array) => (
                                        <React.Fragment key={p}>
                                            {index > 0 && array[index - 1] !== p - 1 && <Text style={{ color: colors.textMuted }}>...</Text>}
                                            <TouchableOpacity
                                                onPress={() => handlePageChange(p)}
                                                style={[styles.pageNumber, page === p && { backgroundColor: colors.primary }]}
                                            >
                                                <Text style={[styles.pageNumberText, page === p && { color: 'white' }]}>{p}</Text>
                                            </TouchableOpacity>
                                        </React.Fragment>
                                    ))
                                }

                                <TouchableOpacity
                                    onPress={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                                >
                                    <Feather name="chevron-right" size={20} color={page === totalPages ? colors.textMuted : colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                />
            )}

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: colors.surface }]}>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="home" size={24} color={colors.primary} />
                    <View style={[styles.navDot, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/quickapply')}>
                    <Feather name="zap" size={24} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted, fontSize: 10 }]}>QuickApply</Text>
                </TouchableOpacity>

                {/* Center FAB - Applications Tracker */}
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, borderColor: colors.background }]} onPress={() => router.push('/applications')}>
                        <Feather name="briefcase" size={28} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/alerts')}>
                    <Feather name="bell" size={24} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted, fontSize: 10 }]}>{t('notifications')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
                    <Feather name="user" size={24} color={colors.textMuted} />
                    <Text style={[styles.navLabel, { color: colors.textMuted, fontSize: 10 }]}>{t('navProfile')}</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={() => { }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    offlineBanner: {
        backgroundColor: '#FEF3C7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    offlineText: {
        color: '#92400E',
        fontSize: typography.xs,
        fontWeight: typography.medium,
    },
    header: {
        paddingHorizontal: spacing.xxl,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + spacing.md : spacing.md,
        paddingBottom: spacing.sm,
    },
    title: {
        fontSize: 24,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        lineHeight: 30,
    },
    titleAccent: {
        color: '#FF6B6B', // Coral/salmon red like the reference
        fontStyle: 'italic',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xxl,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        height: 48,
        borderWidth: 1,
        borderColor: colors.borderLight,
        overflow: 'hidden',
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.base,
        color: colors.textPrimary,
    },
    filterIconBtn: {
        padding: spacing.xs,
    },
    findBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    findBtnText: {
        color: colors.textOnPrimary,
        fontSize: typography.base,
        fontWeight: typography.bold,
    },
    pillsScroll: {
        marginBottom: spacing.md,
        minHeight: 36,
        maxHeight: 48,
        flexGrow: 0,
        flexShrink: 0, // Prevent shrinking when FlatList loads
    },
    pillsContainer: {
        paddingHorizontal: spacing.xxl,
        paddingRight: spacing.xxl,
        gap: spacing.sm,
        alignItems: 'center',
    },
    categoryPill: {
        paddingHorizontal: spacing.md + 2,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.full,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 32,
    },
    categoryPillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryPillText: {
        fontSize: typography.sm, // Back to 12px like reference
        fontWeight: typography.medium,
        color: '#64748B',
    },
    categoryPillTextActive: {
        color: colors.textOnPrimary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    sectionCount: {
        fontSize: typography.xs,
        color: colors.textMuted,
    },
    showAllLink: {
        fontSize: typography.sm,
        color: colors.textMuted,
        fontWeight: typography.medium,
    },
    loadingContainer: {
        flex: 1,
        paddingHorizontal: spacing.xxl,
    },
    listContent: {
        paddingHorizontal: spacing.xxl,
        paddingBottom: 100, // Space for bottom nav
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xxl + spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 20,
    },
    navItem: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    navDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 4,
    },
    fabContainer: {
        position: 'relative',
        bottom: 32,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 6,
        borderColor: colors.background,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    pageBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    pageBtnDisabled: {
        opacity: 0.5,
        backgroundColor: colors.background,
    },
    pageNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
});
