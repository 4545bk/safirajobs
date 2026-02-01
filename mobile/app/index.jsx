import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import { getJobs } from '../services/api';
import { colors } from '../styles/global';

export default function HomeScreen() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [cachedAt, setCachedAt] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        location: '',
        category: '',
        experience: ''
    });

    // Fetch jobs
    const fetchJobs = useCallback(async (page = 1, isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (page === 1) {
                setLoading(true);
            }

            setError(null);

            const response = await getJobs({
                page,
                limit: 20,
                ...filters
            });

            if (response?.success && response?.data) {
                const newJobs = response.data.jobs;

                if (page === 1) {
                    setJobs(newJobs);
                } else {
                    setJobs(prev => [...prev, ...newJobs]);
                }

                setPagination({
                    page: response.data.pagination.page,
                    pages: response.data.pagination.pages,
                    total: response.data.pagination.total,
                    hasMore: response.data.pagination.hasMore
                });

                // Track offline status
                setIsOffline(response.isOffline || false);
                setCachedAt(response.cachedAt || null);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load jobs. Pull down to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    // Initial load and filter changes
    useEffect(() => {
        fetchJobs(1);
    }, [filters]);

    // Pull to refresh
    const onRefresh = () => {
        fetchJobs(1, true);
    };

    // Load more (infinite scroll)
    const loadMore = () => {
        if (!loading && pagination.page < pagination.pages) {
            fetchJobs(pagination.page + 1);
        }
    };

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setJobs([]);
    };

    // Format cached time
    const formatCachedTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    // Render job item
    const renderItem = ({ item }) => <JobCard job={item} />;

    // Render empty state
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No jobs found</Text>
                <Text style={styles.emptyText}>
                    Try adjusting your filters or check back later.
                </Text>
            </View>
        );
    };

    // Render footer
    const renderFooter = () => {
        if (!loading || pagination.page === 1) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineIcon}>📴</Text>
                    <View style={styles.offlineTextContainer}>
                        <Text style={styles.offlineText}>You're offline</Text>
                        <Text style={styles.offlineSubtext}>
                            Showing cached data from {formatCachedTime(cachedAt)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Header Stats */}
            <View style={styles.header}>
                <Text style={styles.statsText}>
                    {pagination.total > 0
                        ? `${pagination.total} jobs available`
                        : 'Loading jobs...'}
                </Text>
            </View>

            {/* Filters */}
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {/* Error State */}
            {error && !loading && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Loading State */}
            {loading && pagination.page === 1 && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Finding opportunities...</Text>
                </View>
            )}

            {/* Job List */}
            {!loading || pagination.page > 1 ? (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                />
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFA500',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    offlineIcon: {
        fontSize: 18,
        marginRight: 10,
    },

    offlineTextContainer: {
        flex: 1,
    },

    offlineText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },

    offlineSubtext: {
        fontSize: 12,
        color: '#333',
    },

    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    statsText: {
        fontSize: 14,
        color: colors.textMuted,
    },

    listContent: {
        padding: 16,
        paddingBottom: 32,
    },

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textSecondary,
    },

    errorContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
    },

    errorText: {
        color: colors.error,
        textAlign: 'center',
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },

    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },

    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    footerLoader: {
        paddingVertical: 20,
    },
});
