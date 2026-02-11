/**
 * Company Profile Screen - View all jobs from an organization
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius, typography, getLogoColor } from '../../theme';
import JobCard from '../../components/JobCard';
import { getBookmarks, toggleBookmark } from '../../services/bookmarks';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api';

export default function CompanyScreen() {
    const { name } = useLocalSearchParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        loadData();
    }, [name]);

    const loadData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/company/${encodeURIComponent(name)}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
            const savedBookmarks = await getBookmarks();
            setBookmarks(savedBookmarks);
        } catch (error) {
            console.error('Failed to load company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async (job) => {
        const isNowBookmarked = await toggleBookmark(job._id);
        if (isNowBookmarked) {
            setBookmarks(prev => [...prev, job._id]);
        } else {
            setBookmarks(prev => prev.filter(id => id !== job._id));
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const company = data?.company;
    const jobs = data?.jobs || [];
    const logoColors = getLogoColor(name || 'Company');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Company Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Company Card */}
                <View style={styles.companyCard}>
                    <View style={[styles.companyLogo, { backgroundColor: logoColors.bg }]}>
                        <Text style={[styles.companyLogoText, { color: logoColors.text }]}>
                            {name?.charAt(0) || '?'}
                        </Text>
                    </View>
                    <Text style={styles.companyName}>{company?.name || name}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Feather name="briefcase" size={18} color={colors.primary} />
                            <Text style={styles.statNumber}>{company?.totalJobs || jobs.length}</Text>
                            <Text style={styles.statLabel}>Open Jobs</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Feather name="folder" size={18} color={colors.primary} />
                            <Text style={styles.statNumber}>{company?.categories?.length || 0}</Text>
                            <Text style={styles.statLabel}>Categories</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Feather name="map-pin" size={18} color={colors.primary} />
                            <Text style={styles.statNumber}>{company?.locations?.length || 0}</Text>
                            <Text style={styles.statLabel}>Locations</Text>
                        </View>
                    </View>

                    {/* Categories */}
                    {company?.categories?.length > 0 && (
                        <View style={styles.tagsSection}>
                            <Text style={styles.tagsLabel}>Hiring in:</Text>
                            <View style={styles.tagsRow}>
                                {company.categories.slice(0, 5).map((cat, i) => (
                                    <View key={i} style={styles.tag}>
                                        <Text style={styles.tagText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Jobs List */}
                <Text style={styles.sectionTitle}>
                    Open Positions ({jobs.length})
                </Text>

                {jobs.map(job => (
                    <JobCard
                        key={job._id}
                        job={job}
                        onPress={() => router.push(`/job/${job._id}`)}
                        onBookmark={handleBookmark}
                        isBookmarked={bookmarks.includes(job._id)}
                    />
                ))}

                {jobs.length === 0 && (
                    <View style={styles.emptyState}>
                        <Feather name="inbox" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No open positions at the moment</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
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
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    content: { flex: 1, padding: 16 },
    companyCard: {
        backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center',
        marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    companyLogo: {
        width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16
    },
    companyLogoText: { fontSize: 32, fontWeight: '700' },
    companyName: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 16, textAlign: 'center' },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
    statLabel: { fontSize: 12, color: colors.textSecondary },
    statDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
    tagsSection: { alignItems: 'center' },
    tagsLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
    tag: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    tagText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 14, color: colors.textSecondary, marginTop: 12 }
});
