/**
 * Bookmarks Screen
 * Shows all saved/bookmarked jobs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getBookmarks, toggleBookmark } from '../services/bookmarks';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function BookmarksScreen() {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkIds, setBookmarkIds] = useState([]);

    // Load bookmarked jobs
    const loadBookmarkedJobs = async () => {
        try {
            setLoading(true);

            // Get bookmark IDs
            const ids = await getBookmarks();
            setBookmarkIds(ids);

            if (ids.length === 0) {
                setJobs([]);
                return;
            }

            // Get all jobs and filter by bookmarked IDs
            const result = await getJobs({ page: 1, limit: 100 });
            const allJobs = result.data?.jobs || result.jobs || [];
            const bookmarkedJobs = allJobs.filter(job => ids.includes(job._id));

            setJobs(bookmarkedJobs);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadBookmarkedJobs();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadBookmarkedJobs();
    };

    const handleJobPress = (job) => {
        router.push(`/job/${job._id}`);
    };

    const handleBookmark = async (job) => {
        await toggleBookmark(job._id);
        // Reload to update the list
        loadBookmarkedJobs();
    };

    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('navFavorites')}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <LoadingState count={3} />
                </View>
            ) : jobs.length === 0 ? (
                <EmptyState
                    message={t('noSavedJobs') || "No saved jobs"}
                    subMessage={t('noSavedJobsHint') || "Jobs you bookmark will appear here for easy access."}
                />
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <JobCard
                            job={item}
                            onPress={() => handleJobPress(item)}
                            onBookmark={handleBookmark}
                            isBookmarked={true}
                            colors={colors}
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
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    backBtn: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xl,
    },
    listContent: {
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xl,
        paddingBottom: 20,
    },
});
